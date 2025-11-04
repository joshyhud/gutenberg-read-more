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
   * List all posts within a date range
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
   * [--limit=<number>]
   * : Maximum number of posts to return. Default: no limit.
   *
   * ## EXAMPLES
   *
   *     # List posts from last 30 days (default)
   *     wp dmg-read-more search
   *
   *     # List posts from specific date range
   *     wp dmg-read-more search --date-after=2025-10-01 --date-before=2025-11-01
   *
   *     # Get JSON output
   *     wp dmg-read-more search --format=json
   *
   *     # Limit to 20 posts
   *     wp dmg-read-more search --limit=20
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
    $limit = isset($assoc_args['limit']) ? intval($assoc_args['limit']) : 0;

    // Validate dates
    if (!$this->validate_date($date_after) || !$this->validate_date($date_before)) {
      WP_CLI::error('Invalid date format. Use YYYY-MM-DD format.');
    }

    // Build SQL to get all posts in date range
    $sql = $wpdb->prepare(
      "
            SELECT p.ID, p.post_title, p.post_date, p.post_status
            FROM {$wpdb->posts} p
            WHERE p.post_type = 'post'
              AND p.post_status = 'publish'
              AND p.post_date BETWEEN %s AND %s
            ORDER BY p.post_date DESC
            ",
      $date_after . ' 00:00:00',
      $date_before . ' 23:59:59'
    );

    // Add limit if specified
    if ($limit > 0) {
      $sql .= $wpdb->prepare(" LIMIT %d", $limit);
    }

    $results = $wpdb->get_results($sql);

    if (empty($results)) {
      WP_CLI::warning("No posts found between {$date_after} and {$date_before}.");
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
    $limit_text = $limit > 0 ? " (limited to {$limit})" : "";
    WP_CLI::line("Found {$total_found} posts between {$date_after} and {$date_before}{$limit_text}");
    WP_CLI::line('');

    // Output data
    WP_CLI\Utils\format_items($format, $data, array('ID', 'Title', 'Date', 'Status', 'URL'));

    WP_CLI::success("Command completed successfully.");
  }

  /**
   * Debug command to check what posts exist and what blocks they contain
   *
   * ## OPTIONS
   *
   * [--limit=<number>]
   * : Number of posts to check. Default 10.
   *
   * [--show-content]
   * : Show post content to see block patterns.
   *
   * ## EXAMPLES
   *
   *     # Check recent posts for any blocks
   *     wp dmg-read-more debug
   *
   *     # Check and show content
   *     wp dmg-read-more debug --show-content
   *
   * @param array $args
   * @param array $assoc_args
   */
  public function debug($args, $assoc_args)
  {
    global $wpdb;

    $limit = isset($assoc_args['limit']) ? intval($assoc_args['limit']) : 10;
    $show_content = isset($assoc_args['show-content']);

    // Get recent posts
    $sql = $wpdb->prepare(
      "SELECT ID, post_title, post_date, post_content 
       FROM {$wpdb->posts} 
       WHERE post_type = 'post' 
       AND post_status = 'publish' 
       ORDER BY post_date DESC 
       LIMIT %d",
      $limit
    );

    $posts = $wpdb->get_results($sql);

    if (empty($posts)) {
      WP_CLI::warning("No published posts found.");
      return;
    }

    WP_CLI::line("Checking {$limit} most recent posts for blocks:");
    WP_CLI::line('');

    foreach ($posts as $post) {
      WP_CLI::line("Post ID: {$post->ID} - {$post->post_title}");
      WP_CLI::line("Date: {$post->post_date}");

      // Check for various block patterns
      $has_gutenberg = strpos($post->post_content, '<!-- wp:') !== false;
      $has_our_block = strpos($post->post_content, '<!-- wp:create-block/gutenberg-read-more') !== false;

      WP_CLI::line("Has Gutenberg blocks: " . ($has_gutenberg ? 'Yes' : 'No'));
      WP_CLI::line("Has our block: " . ($has_our_block ? 'Yes' : 'No'));

      if ($show_content) {
        WP_CLI::line("Content preview:");
        WP_CLI::line(substr($post->post_content, 0, 200) . '...');
      }

      WP_CLI::line('---');
    }

    WP_CLI::success("Debug completed.");
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
