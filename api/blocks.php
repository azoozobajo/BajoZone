<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/content-repository.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

requireAdminAuth();

/* ── Allowed block types ─────────────────────────────────────── */
const BZ_BLOCK_TYPES = [
    'stat_cards', 'chart', 'timeline', 'insight_cards',
    'comparison_table', 'method_note', 'source_box', 'accordion',
];

const BZ_ARTICLE_TYPES = ['standard', 'interactive', 'report'];

const BZ_TONE_VALUES = ['default', 'success', 'warning', 'danger', 'info', 'gold', 'dark'];

const BZ_CHART_TYPES = ['bar', 'line', 'doughnut', 'pie'];

/* ── Security helpers ────────────────────────────────────────── */
function bzStripDangerous(string $value): string
{
    $value = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $value);
    $value = preg_replace('/<style\b[^>]*>.*?<\/style>/is', '', $value);
    $value = preg_replace('/\bon\w+\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>]*)/i', '', $value);
    $value = preg_replace('/javascript\s*:/i', 'nojavascript:', $value);
    $value = preg_replace('/vbscript\s*:/i', 'novbscript:', $value);
    return $value;
}

function bzSanitizeString($value): string
{
    if (!is_string($value)) {
        return '';
    }
    return bzStripDangerous(trim($value));
}

function bzSafeUrl($value): string
{
    $url = trim((string) ($value ?? ''));
    if ($url === '') {
        return '';
    }
    if (preg_match('/^(javascript|vbscript|data)\s*:/i', $url)) {
        return '';
    }
    return $url;
}

function bzSanitizeArray(array $arr, int $depth = 0): array
{
    if ($depth > 6) {
        return [];
    }
    $out = [];
    foreach ($arr as $k => $v) {
        $safeKey = is_string($k) ? bzStripDangerous($k) : $k;
        if (is_array($v)) {
            $out[$safeKey] = bzSanitizeArray($v, $depth + 1);
        } elseif (is_string($v)) {
            $out[$safeKey] = bzSanitizeString($v);
        } elseif (is_numeric($v) || is_bool($v) || $v === null) {
            $out[$safeKey] = $v;
        }
    }
    return $out;
}

/* ── Block-type validation ───────────────────────────────────── */
function bzValidateBlock(string $type, array $data): array
{
    $errors = [];

    switch ($type) {
        case 'stat_cards':
            if (isset($data['cards']) && !is_array($data['cards'])) {
                $errors[] = 'stat_cards: "cards" must be an array';
            }
            break;

        case 'chart':
            if (!isset($data['chartType']) || !in_array($data['chartType'], BZ_CHART_TYPES, true)) {
                $errors[] = 'chart: "chartType" must be one of: ' . implode(', ', BZ_CHART_TYPES);
            }
            if (!isset($data['labels']) || !is_array($data['labels'])) {
                $errors[] = 'chart: "labels" must be an array';
            }
            if (!isset($data['datasets']) || !is_array($data['datasets'])) {
                $errors[] = 'chart: "datasets" must be an array';
            }
            break;

        case 'timeline':
            if (isset($data['items']) && !is_array($data['items'])) {
                $errors[] = 'timeline: "items" must be an array';
            }
            break;

        case 'insight_cards':
            if (isset($data['cards']) && !is_array($data['cards'])) {
                $errors[] = 'insight_cards: "cards" must be an array';
            }
            break;

        case 'comparison_table':
            if (!isset($data['columns']) || !is_array($data['columns'])) {
                $errors[] = 'comparison_table: "columns" must be an array';
            }
            if (!isset($data['rows']) || !is_array($data['rows'])) {
                $errors[] = 'comparison_table: "rows" must be an array';
            }
            break;

        case 'method_note':
            if (!isset($data['body']) || trim((string) $data['body']) === '') {
                $errors[] = 'method_note: "body" is required';
            }
            if (isset($data['tone']) && !in_array($data['tone'], BZ_TONE_VALUES, true)) {
                $errors[] = 'method_note: "tone" must be one of: ' . implode(', ', BZ_TONE_VALUES);
            }
            break;

        case 'source_box':
            if (isset($data['items']) && !is_array($data['items'])) {
                $errors[] = 'source_box: "items" must be an array';
            }
            break;

        case 'accordion':
            if (!isset($data['items']) || !is_array($data['items'])) {
                $errors[] = 'accordion: "items" must be an array';
            } elseif (!$data['items']) {
                $errors[] = 'accordion: "items" must not be empty';
            }
            break;
    }

    return $errors;
}

/* ── GET — fetch blocks for article ─────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $articleId = trim((string) ($_GET['article_id'] ?? ''));
    if ($articleId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'article_id is required']);
        exit;
    }

    try {
        $pdo = getDb();

        $row = contentFetchOne(
            'SELECT article_type FROM articles WHERE id = ? LIMIT 1',
            [$articleId]
        );
        $articleType = isset($row['article_type']) ? (string) $row['article_type'] : 'standard';

        $rows = contentFetchAll(
            'SELECT id, block_type, block_order, block_data
             FROM article_blocks
             WHERE article_id = ?
             ORDER BY block_order ASC, id ASC',
            [$articleId]
        );

        $blocks = array_map(function (array $r): array {
            $data = json_decode((string) $r['block_data'], true);
            return [
                'id'    => (string) $r['id'],
                'type'  => (string) $r['block_type'],
                'order' => (int)    $r['block_order'],
                'data'  => is_array($data) ? $data : [],
            ];
        }, $rows);

        echo json_encode([
            'article_id'   => $articleId,
            'article_type' => $articleType,
            'blocks'       => $blocks,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (Throwable $e) {
        error_log('BajoZone blocks GET failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch blocks']);
    }
    exit;
}

/* ── POST — save blocks for article ─────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'صيغة JSON غير صحيحة.']);
        exit;
    }

    $articleId   = trim((string) ($body['article_id']   ?? ''));
    $articleType = trim((string) ($body['article_type'] ?? 'standard'));
    $blocks      = $body['blocks'] ?? [];

    if ($articleId === '') {
        http_response_code(400);
        echo json_encode(['error' => 'article_id is required']);
        exit;
    }

    if (!in_array($articleType, BZ_ARTICLE_TYPES, true)) {
        $articleType = 'standard';
    }

    if (!is_array($blocks)) {
        $blocks = [];
    }

    /* Validate and sanitize every block */
    $validatedBlocks = [];
    $allErrors       = [];

    foreach (array_values($blocks) as $idx => $block) {
        if (!is_array($block)) {
            $allErrors[] = "بلوك رقم $idx: يجب أن يكون كائنًا.";
            continue;
        }

        $blockType = trim((string) ($block['type'] ?? ''));
        if (!in_array($blockType, BZ_BLOCK_TYPES, true)) {
            $allErrors[] = "بلوك رقم $idx: نوع البلوك غير مدعوم «$blockType».";
            continue;
        }

        $blockData = $block['data'] ?? [];
        if (!is_array($blockData)) {
            $allErrors[] = "بلوك رقم $idx: حقل «data» يجب أن يكون كائنًا.";
            continue;
        }

        $sanitized = bzSanitizeArray($blockData);

        $typeErrors = bzValidateBlock($blockType, $sanitized);
        if ($typeErrors) {
            foreach ($typeErrors as $te) {
                $allErrors[] = "بلوك رقم $idx: $te";
            }
            continue;
        }

        $validatedBlocks[] = [
            'type'  => $blockType,
            'order' => (int) ($block['order'] ?? $idx),
            'data'  => $sanitized,
        ];
    }

    if ($allErrors) {
        http_response_code(422);
        echo json_encode(['errors' => $allErrors], JSON_UNESCAPED_UNICODE);
        exit;
    }

    /* Persist */
    try {
        $pdo = getDb();
        $pdo->beginTransaction();

        /* Update article_type column — falls back gracefully if column missing */
        try {
            $pdo->prepare('UPDATE articles SET article_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                ->execute([$articleType, $articleId]);
        } catch (PDOException $colErr) {
            /* Column does not yet exist (migration not run) — store in data_json */
            $artRow = contentFetchOne('SELECT data_json FROM articles WHERE id = ? LIMIT 1', [$articleId]);
            if ($artRow !== null) {
                $artData = json_decode((string) ($artRow['data_json'] ?? '{}'), true) ?: [];
                $artData['article_type'] = $articleType;
                $pdo->prepare('UPDATE articles SET data_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    ->execute([
                        json_encode($artData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                        $articleId,
                    ]);
            }
        }

        /* Replace all blocks for this article */
        $pdo->prepare('DELETE FROM article_blocks WHERE article_id = ?')->execute([$articleId]);

        if ($validatedBlocks) {
            $ins = $pdo->prepare(
                'INSERT INTO article_blocks (id, article_id, block_type, block_order, block_data)
                 VALUES (?, ?, ?, ?, ?)'
            );
            foreach ($validatedBlocks as $blk) {
                $ins->execute([
                    'blk_' . bin2hex(random_bytes(8)),
                    $articleId,
                    $blk['type'],
                    $blk['order'],
                    json_encode($blk['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ]);
            }
        }

        $pdo->commit();

        echo json_encode([
            'success'      => true,
            'article_id'   => $articleId,
            'article_type' => $articleType,
            'blocks_saved' => count($validatedBlocks),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } catch (Throwable $e) {
        if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('BajoZone blocks POST failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'فشل حفظ البلوكات.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
