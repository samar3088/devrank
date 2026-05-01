<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('super_admin')->first();
        if (!$admin) {
            $this->command->warn('No super_admin found. Skipping QuizSeeder.');
            return;
        }

        $this->createReactQuiz($admin);
        $this->createLaravelQuiz($admin);
        $this->createSystemDesignQuiz($admin);

        $this->command->info('QuizSeeder: 3 quizzes created successfully.');
    }

    // ── Quiz 1: React Fundamentals (Easy, MCQ only) ──────────────
    private function createReactQuiz(User $admin): void
    {
        $tag  = Tag::where('name', 'like', '%React%')->where('status', 'approved')->first();

        $quiz = Quiz::create([
            'tag_id'             => $tag?->id,
            'created_by'         => $admin->id,
            'title'              => 'React Fundamentals',
            'slug'               => 'react-fundamentals',
            'description'        => 'Test your knowledge of core React concepts including hooks, state, props, and component lifecycle.',
            'difficulty'         => 'easy',
            'time_limit_minutes' => 20,
            'passing_score'      => 60,
            'max_attempts'       => 2,
            'status'             => 'published',
        ]);

        $questions = [
            [
                'body'        => 'What hook do you use to manage local state in a functional React component?',
                'explanation' => 'useState returns a state variable and a setter function. It replaces this.setState in class components.',
                'options'     => [
                    ['text' => 'useEffect',  'correct' => false],
                    ['text' => 'useState',   'correct' => true],
                    ['text' => 'useContext', 'correct' => false],
                    ['text' => 'useRef',     'correct' => false],
                ],
            ],
            [
                'body'        => 'Which of the following correctly describes the Virtual DOM?',
                'explanation' => 'The Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to batch and minimise actual DOM updates.',
                'options'     => [
                    ['text' => 'A direct reference to the browser\'s DOM nodes',                                       'correct' => false],
                    ['text' => 'A JavaScript object that is a lightweight copy of the real DOM',                       'correct' => true],
                    ['text' => 'A browser API for manipulating HTML elements faster',                                  'correct' => false],
                    ['text' => 'A server-side rendering technique that speeds up initial page load',                   'correct' => false],
                ],
            ],
            [
                'body'        => 'What is the correct way to pass a value from a parent component to a child component in React?',
                'explanation' => 'Props are the mechanism for passing data from parent to child. They are read-only in the child component.',
                'options'     => [
                    ['text' => 'Using global state',                    'correct' => false],
                    ['text' => 'Using props',                           'correct' => true],
                    ['text' => 'Using localStorage',                    'correct' => false],
                    ['text' => 'Using a direct DOM reference (ref)',    'correct' => false],
                ],
            ],
            [
                'body'        => 'What does the useEffect hook with an empty dependency array [] do?',
                'explanation' => 'An empty dependency array means the effect runs once — after the initial render — equivalent to componentDidMount in class components.',
                'options'     => [
                    ['text' => 'Runs the effect on every render',                          'correct' => false],
                    ['text' => 'Runs the effect only when state changes',                  'correct' => false],
                    ['text' => 'Runs the effect once after the initial render',            'correct' => true],
                    ['text' => 'Prevents the component from re-rendering',                 'correct' => false],
                ],
            ],
            [
                'body'        => 'What is the purpose of the "key" prop when rendering a list in React?',
                'explanation' => 'Keys help React identify which items in a list have changed, been added, or removed. They must be unique among siblings.',
                'options'     => [
                    ['text' => 'It provides styling to each list item',                                        'correct' => false],
                    ['text' => 'It helps React identify which items have changed, for efficient re-rendering',  'correct' => true],
                    ['text' => 'It determines the order in which items are rendered',                          'correct' => false],
                    ['text' => 'It acts as an index reference for data fetching',                              'correct' => false],
                ],
            ],
        ];

        $this->addMcqQuestions($quiz, $questions, marks: 10);
    }

    // ── Quiz 2: Laravel Backend (Medium, MCQ + coding) ────────────
    private function createLaravelQuiz(User $admin): void
    {
        $tag = Tag::where('name', 'like', '%Laravel%')->where('status', 'approved')->first();

        $quiz = Quiz::create([
            'tag_id'             => $tag?->id,
            'created_by'         => $admin->id,
            'title'              => 'Laravel Backend Essentials',
            'slug'               => 'laravel-backend-essentials',
            'description'        => 'Test your Laravel knowledge — routing, Eloquent, middleware, and service architecture.',
            'difficulty'         => 'medium',
            'time_limit_minutes' => 30,
            'passing_score'      => 65,
            'max_attempts'       => 1,
            'status'             => 'published',
        ]);

        // MCQ questions
        $mcqQuestions = [
            [
                'body'        => 'Which Eloquent method retrieves a model by its primary key and throws an exception if not found?',
                'explanation' => 'findOrFail() throws a ModelNotFoundException if the record is not found, which Laravel automatically converts to a 404 response.',
                'options'     => [
                    ['text' => 'find()',          'correct' => false],
                    ['text' => 'findOrFail()',    'correct' => true],
                    ['text' => 'firstOrFail()',   'correct' => false],
                    ['text' => 'where()->get()',  'correct' => false],
                ],
            ],
            [
                'body'        => 'What is the purpose of Laravel middleware?',
                'explanation' => 'Middleware filters HTTP requests entering the application. Common uses include authentication, logging, CORS, and rate limiting.',
                'options'     => [
                    ['text' => 'To define database relationships between models',                         'correct' => false],
                    ['text' => 'To filter and handle HTTP requests before they reach the controller',     'correct' => true],
                    ['text' => 'To manage job queues and background processes',                           'correct' => false],
                    ['text' => 'To compile and cache application views',                                 'correct' => false],
                ],
            ],
            [
                'body'        => 'In Laravel, what does the N+1 query problem refer to?',
                'explanation' => 'N+1 occurs when you load a collection then access a relation on each item, causing 1 query for the collection + N queries for each relation. Use eager loading (with()) to solve it.',
                'options'     => [
                    ['text' => 'Running one query to fetch all records and one more to count them',           'correct' => false],
                    ['text' => 'Running one query for a collection plus one additional query per record to load a relation', 'correct' => true],
                    ['text' => 'Executing N database writes followed by a single commit',                    'correct' => false],
                    ['text' => 'A pagination issue where the first page loads N+1 records',                  'correct' => false],
                ],
            ],
        ];

        $this->addMcqQuestions($quiz, $mcqQuestions, marks: 10);

        // Coding question
        $codingQ = QuizQuestion::create([
            'quiz_id'      => $quiz->id,
            'body'         => "Write a Laravel Eloquent scope that filters users who have been active in the last 30 days.\n\nThe 'last_active_at' column exists on the users table. The scope should be named 'recentlyActive' and must be usable as User::recentlyActive()->get().",
            'type'         => 'coding',
            'language'     => 'php',
            'marks'        => 20,
            'order_column' => 4,
            'explanation'  => 'Local query scopes in Laravel are defined as scopeXxx($query) methods on the model. They automatically receive the query builder instance.',
            'starter_code' => "<?php\n\n// Inside the User model class:\n\npublic function scopeRecentlyActive(\$query)\n{\n    // Your code here\n}",
        ]);

        $quiz->recalculateTotalMarks();
    }

    // ── Quiz 3: System Design (Hard, mixed) ──────────────────────
    private function createSystemDesignQuiz(User $admin): void
    {
        $tag = Tag::whereIn('name', ['System Design', 'system-design', 'Backend'])
            ->where('status', 'approved')
            ->first();

        $quiz = Quiz::create([
            'tag_id'             => $tag?->id,
            'created_by'         => $admin->id,
            'title'              => 'System Design Fundamentals',
            'slug'               => 'system-design-fundamentals',
            'description'        => 'Test your understanding of scalability, caching, databases, and distributed systems fundamentals.',
            'difficulty'         => 'hard',
            'time_limit_minutes' => 40,
            'passing_score'      => 70,
            'max_attempts'       => 1,
            'status'             => 'published',
        ]);

        $mcqQuestions = [
            [
                'body'        => 'What is the primary purpose of a Content Delivery Network (CDN)?',
                'explanation' => 'A CDN caches static content at geographically distributed edge servers so users are served from the closest location, reducing latency.',
                'options'     => [
                    ['text' => 'To encrypt all traffic between client and server',                                          'correct' => false],
                    ['text' => 'To serve cached content from servers geographically closer to the user',                   'correct' => true],
                    ['text' => 'To compress database queries for faster execution',                                        'correct' => false],
                    ['text' => 'To load balance traffic between multiple application servers',                             'correct' => false],
                ],
            ],
            [
                'body'        => 'Which of the following best describes the CAP theorem?',
                'explanation' => 'CAP states that a distributed system can only guarantee 2 of 3: Consistency, Availability, and Partition tolerance. In practice, partition tolerance is unavoidable, so you choose between CP and AP.',
                'options'     => [
                    ['text' => 'A distributed system can simultaneously guarantee Consistency, Availability, and Partition tolerance',     'correct' => false],
                    ['text' => 'A distributed system can guarantee at most 2 of: Consistency, Availability, and Partition tolerance',      'correct' => true],
                    ['text' => 'Caching, Authentication, and Performance are the three pillars of system design',                         'correct' => false],
                    ['text' => 'A database must choose between ACID compliance and horizontal scalability',                               'correct' => false],
                ],
            ],
            [
                'body'        => 'What is the key advantage of using a message queue (e.g., RabbitMQ, SQS) in a distributed system?',
                'explanation' => 'Message queues decouple producers and consumers. The producer does not need to wait for the consumer — it fires and forgets, improving throughput and resilience.',
                'options'     => [
                    ['text' => 'It provides faster database reads by caching query results',          'correct' => false],
                    ['text' => 'It decouples services so producers and consumers can operate independently and asynchronously', 'correct' => true],
                    ['text' => 'It encrypts messages between microservices automatically',            'correct' => false],
                    ['text' => 'It replaces the need for a load balancer in high-traffic systems',    'correct' => false],
                ],
            ],
        ];

        $this->addMcqQuestions($quiz, $mcqQuestions, marks: 15);

        // Coding question
        QuizQuestion::create([
            'quiz_id'      => $quiz->id,
            'body'         => "Design a simple rate limiter in PHP/JavaScript.\n\nImplement a function that:\n- Accepts a user_id and a limit (max requests per minute)\n- Returns true if the request is allowed\n- Returns false if the rate limit has been exceeded\n\nYou may use any data structure. Explain your approach in a comment above the function.",
            'type'         => 'coding',
            'language'     => 'javascript',
            'marks'        => 25,
            'order_column' => 4,
            'explanation'  => 'A sliding window or token bucket algorithm is commonly used. A simple approach uses a hash map of user_id → [timestamps], filtering timestamps within the last 60 seconds.',
            'starter_code' => "// Rate Limiter\n// Explain your approach here\n\nfunction isAllowed(userId, limit) {\n    // Your implementation\n}",
        ]);

        $quiz->recalculateTotalMarks();
    }

    // ── Helper ───────────────────────────────────────────────────
    private function addMcqQuestions(Quiz $quiz, array $questions, int $marks): void
    {
        foreach ($questions as $i => $q) {
            $question = QuizQuestion::create([
                'quiz_id'      => $quiz->id,
                'body'         => $q['body'],
                'type'         => 'mcq',
                'marks'        => $marks,
                'order_column' => $i + 1,
                'explanation'  => $q['explanation'],
            ]);

            foreach ($q['options'] as $j => $opt) {
                QuizOption::create([
                    'question_id'  => $question->id,
                    'option_text'  => $opt['text'],
                    'is_correct'   => $opt['correct'],
                    'order_column' => $j,
                ]);
            }
        }

        $quiz->recalculateTotalMarks();
    }
}
