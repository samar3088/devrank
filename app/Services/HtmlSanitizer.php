<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Sanitises user-authored rich text (forum topics & replies) before it is
 * stored, so the HTML we later render with dangerouslySetInnerHTML can never
 * carry scripts, event handlers, javascript: URLs, iframes, or styles.
 *
 * This is the single trust boundary for forum HTML — always run body content
 * through clean() on the way IN (never rely on the client editor).
 */
class HtmlSanitizer
{
    private HTMLPurifier $purifier;

    public function __construct()
    {
        $config = HTMLPurifier_Config::createDefault();

        // Whitelist: exactly the formatting the TipTap editor can produce.
        $config->set('HTML.Allowed', implode(',', [
            'p', 'br', 'strong', 'em', 's', 'u',
            'h2', 'h3',
            'ul', 'ol', 'li',
            'blockquote',
            'pre', 'code',
            'a[href|title|rel|target]',
            'img[src|alt|width]',
            'hr',
        ]));

        // Links: force safe schemes and add rel/target hardening.
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
        $config->set('HTML.TargetBlank', true);       // target="_blank" on links
        $config->set('HTML.Nofollow', true);          // rel="nofollow" on links
        $config->set('Attr.AllowedFrameTargets', ['_blank']);

        // Only allow images we host (relative /storage/...) or absolute http(s).
        $config->set('URI.DisableExternalResources', false);
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('AutoFormat.AutoParagraph', false);

        // Compiled-definition cache (created on demand).
        $cacheDir = storage_path('app/htmlpurifier');
        if (! is_dir($cacheDir)) {
            @mkdir($cacheDir, 0775, true);
        }
        $config->set('Cache.SerializerPath', $cacheDir);

        $this->purifier = new HTMLPurifier($config);
    }

    public function clean(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        return $this->purifier->purify($html);
    }

    /**
     * Plain-text length of the content (tags stripped), for validation.
     */
    public function textLength(?string $html): int
    {
        return mb_strlen(trim(strip_tags((string) $html)));
    }
}
