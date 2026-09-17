import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useState } from 'react';

function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
}

async function uploadImage(file) {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/forum/upload-image', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'), Accept: 'application/json' },
        body: fd,
        credentials: 'same-origin',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.errors?.image?.[0] || 'Image upload failed.');
    }
    const data = await res.json();
    return data.url;
}

/**
 * TipTap-based rich text editor. Emits sanitised-on-save HTML via onChange.
 * The server (HtmlSanitizer) is the security boundary — this is UX only.
 */
export default function RichTextEditor({ value = '', onChange, placeholder = 'Write your answer…' }) {
    const fileInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            Image.configure({ inline: false, HTMLAttributes: { class: 'rt-img' } }),
            Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'nofollow noopener', target: '_blank' } }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getText().trim() === '' ? '' : editor.getHTML();
            onChange?.(html);
        },
        editorProps: {
            attributes: { class: 'rt-surface', 'aria-label': 'Rich text editor' },
        },
    });

    if (!editor) return null;

    function addLink() {
        const prev = editor.getAttributes('link').href || '';
        const url = window.prompt('Link URL', prev);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }

    async function onPickImage(e) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploadError('');
        setUploading(true);
        try {
            const url = await uploadImage(file);
            editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    }

    const Btn = ({ onClick, active, disabled, title, children }) => (
        <button
            type="button"
            className={`rt-btn${active ? ' is-active' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
        >
            {children}
        </button>
    );

    return (
        <div className="rt-editor">
            <div className="rt-toolbar" role="toolbar" aria-label="Formatting">
                <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></Btn>
                <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></Btn>
                <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
                <span className="rt-sep" />
                <Btn title="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
                <Btn title="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
                <span className="rt-sep" />
                <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Btn>
                <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Btn>
                <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</Btn>
                <Btn title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</Btn>
                <span className="rt-sep" />
                <Btn title="Add link" active={editor.isActive('link')} onClick={addLink}>🔗</Btn>
                <Btn title="Insert image" disabled={uploading} onClick={() => fileInput.current?.click()}>{uploading ? '…' : '🖼'}</Btn>
                <input ref={fileInput} type="file" accept="image/*" hidden onChange={onPickImage} />
            </div>

            <EditorContent editor={editor} />

            {uploadError && <div className="form-error" style={{ marginTop: 6 }}>{uploadError}</div>}
        </div>
    );
}
