<?php

/**
 * Post CLI Commands for Gutenberg Read More plugin
 */

// Ensure WP_CLI is available
if (!defined('WP_CLI') || !WP_CLI) {
  return;
}

/**
 * DMG Read More CLI Commands
 */
class DMG_Read_More_CLI
{
  /**
   * Search for posts containing dmg/read-more blocks
   *
   * ## OPTIONS
   *
   * [--date-after=<date>]
   * : Start date (YYYY-MM-DD format). Defaults to 30 days ago.
   *
   * [--date-before=<date>]
   * : End date (YYYY-MM-DD format). Defaults to today.
   *
   * [--format=<format>]
   * : Output format. Options: table, csv, json, yaml. Default: table.
   *
   * ## EXAMPLES
   *
   *     # Search posts with dmg/read-more blocks from last 30 days
   *     wp dmg-read-more search
   *
   *     # Search with specific date range
   *     wp dmg-read-more search --date-after=2025-10-01 --date-before=2025-11-01
   *
   *     # Get JSON output
   *     wp dmg-read-more search --format=json
   *
   * @param array $args
   * @param array $assoc_args
   */
  public function search($args, $assoc_args)
  {
    global $wpdb;

    // Parse date range
    $date_before = !empty($assoc_args['date-before']) ? sanitize_text_field($assoc_args['date-before']) : date('Y-m-d');
    $date_after  = !empty($assoc_args['date-after']) ? sanitize_text_field($assoc_args['date-after']) : date('Y-m-d', strtotime('-30 days'));
    $format = isset($assoc_args['format']) ? $assoc_args['format'] : 'table';

    // Validate dates
    if (!$this->validate_date($date_after) || !$this->validate_date($date_before)) {
      WP_CLI::error('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Build SQL manually for performance
    // Using WP_Query here would be slower on tens of millions of rows
    $like_pattern = '%<!-- wp:dmg/read-more%';
    $sql = $wpdb->prepare(
      "
            SELECT p.ID, p.post_title, p.post_date, p.post_status
            FROM {$wpdb->posts} p
            WHERE p.post_type = 'post'
              AND p.post_status = 'publish'
              AND p.post_date BETWEEN %s AND %s
              AND p.post_content LIKE %s
            ORDER BY p.post_date DESC
            ",
      $date_after . ' 00:00:00',
      $date_before . ' 23:59:59',
      $like_pattern
    );

    $results = $wpdb->get_results($sql);

    if (empty($results)) {
      WP_CLI::warning("No posts found containing the dmg/read-more block between {$date_after} and {$date_before}.");
      return;
    }

    // Prepare data for output
    $data = array();
    foreach ($results as $post) {
      $data[] = array(
        'ID' => $post->ID,
        'Title' => $post->post_title,
        'Date' => $post->post_date,
        'Status' => $post->post_status,
        'URL' => get_permalink($post->ID),
      );
    }

    // Show summary
    $total_found = count($results);
    WP_CLI::line("Found {$total_found} posts with dmg/read-more blocks between {$date_after} and {$date_before}");
    WP_CLI::line('');

    // Output data
    if ($format === 'table' && $total_found > 0) {
      WP_CLI\Utils\format_items($format, $data, array('ID', 'Title', 'Date', 'Status', 'URL'));
    } elseif ($total_found > 0) {
      WP_CLI\Utils\format_items($format, $data, array('ID', 'Title', 'Date', 'Status', 'URL'));
    }

    WP_CLI::success("Command completed successfully.");
  }

  /**
   * Validate date format
   *
   * @param string $date
   * @return bool
   */
  private function validate_date($date)
  {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
  }
}

// Register the CLI command
WP_CLI::add_command('dmg-read-more', 'DMG_Read_More_CLI');
