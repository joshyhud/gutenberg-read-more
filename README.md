# Gutenberg Read More Plugin

A WordPress Gutenberg block plugin that allows users to easily search for and create "Read More" links to other blog posts, complete with a WP-CLI command for post referencing.

## About this plugin

The Gutenberg Read More plugin provides two main features:

### 1. **Gutenberg Block Editor Integration**

- **Smart Post Search**: Search for posts by title, content, or specific post ID
- **Live Preview**: See post details (ID, title, publication date) before selecting
- **Easy Link Creation**: Automatically generates "Read more" links with proper permalinks
- **Pagination**: Browse through large numbers of posts with built-in pagination

### 2. **WP-CLI Command for Developers**

- **Bulk Post Listing**: Get all posts within specified date ranges
- **Performance Optimized**: Direct database queries for handling large datasets
- **Flexible Filtering**: Customizable date ranges and result limits

# Requirements

- **WordPress**: 6.7 or higher
- **PHP**: 7.4 or higher
- **WP-CLI**: For command-line functionality (optional)

# Installation

## Download and upload via WordPress Admin

1. Download the plugin ZIP file
2. Go to Plugins / Add New / Upload Plugin
3. Choose the gutenberg-read-more.zip file and click "Install Now"
4. Then activate the plugin

## Using the Gutenberg Block

### Adding a Read More Block

1. **In the Block Editor**: Click the "+" button and search for "Gutenberg Read More"
2. **Select the Block**: Add it to your post or page
3. **Search for Posts**: Use the sidebar panel to search for posts
4. **Select a Post**: Click "Select" next to your desired post
5. **Automatic Link**: The block automatically creates a "Read more" link

### Block Features

- **Search Options**:

  - Enter text to search post titles and content
  - Enter a number to find a specific post by ID
  - Browse posts by date (most recent first)

- **Real-time Search**: Results update as you type
- **Pagination**: Navigate through multiple pages of results
- **Post Information**: See post ID, title, and publication date

### Block Output

The block renders as:

```html
<p class="dmg-read-more">
	Read more: <a href="[post-permalink]">[post-title]</a>
</p>
```

## WP-CLI Commands

The plugin includes powerful WP-CLI command for developers and site administrators.

### Basic Usage

```bash
# List all posts from last 30 days
wp dmg-read-more search

# List posts from specific date range
wp dmg-read-more search --date-after=2025-10-01 --date-before=2025-10-31

# Limit results
wp dmg-read-more search --limit=20

# Export to JSON
wp dmg-read-more search --format=json > posts.json
```

### Available Parameters

| Parameter       | Description                           | Default     |
| --------------- | ------------------------------------- | ----------- |
| `--date-after`  | Start date (YYYY-MM-DD)               | 30 days ago |
| `--date-before` | End date (YYYY-MM-DD)                 | Today       |
| `--format`      | Output format: table, csv, json, yaml | table       |
| `--limit`       | Maximum number of posts               | No limit    |

### Output Fields

Each post includes:

- **ID**: WordPress post ID
- **Title**: Post title
- **Date**: Publication date and time
- **Status**: Post status (publish, draft, etc.)
- **URL**: Full permalink to the post

### Examples

```bash
# Get last week's posts as JSON
wp dmg-read-more search --date-after=$(date -d '7 days ago' +%Y-%m-%d) --format=json

# Export October 2025 posts to CSV
wp dmg-read-more search --date-after=2025-10-01 --date-before=2025-10-31 --format=csv > october_posts.csv

# Get top 10 most recent posts
wp dmg-read-more search --limit=10

# Debug command to check available posts
wp dmg-read-more debug
wp dmg-read-more debug --show-content
```

## DevKinsta Usage

If you're using DevKinsta (Docker-based local development), run commands inside the container:

```bash
# Basic search
docker exec -it devkinsta_fpm wp dmg-read-more search --allow-root

# With parameters
docker exec -it devkinsta_fpm wp dmg-read-more search --date-after=2025-10-01 --limit=20 --allow-root

# Export to file
docker exec -it devkinsta_fpm wp dmg-read-more search --format=json --allow-root > posts.json
```

## Technical Details

### Block Information

- **Block Name**: `create-block/gutenberg-read-more`
- **Category**: Widgets
- **API Version**: 3
- **WordPress Requirements**: 6.7+
- **PHP Requirements**: 7.4+

### Attributes

```json
{
	"selectedPostId": { "type": "number", "default": 0 },
	"selectedPostTitle": { "type": "string", "default": "" },
	"selectedPostPermalink": { "type": "string", "default": "" }
}
```

### Database Performance

- Uses direct SQL queries via `$wpdb` for optimal performance
- Efficient pagination for large datasets
- Date range filtering at database level
- No unnecessary post meta or taxonomy queries

## Customization

### CSS Styling

The block outputs with the class `dmg-read-more`, allowing for custom styling:

```css
.dmg-read-more {
	/* Your custom styles */
	margin: 1rem 0;
	padding: 1rem;
	border-left: 3px solid #0073aa;
}

.dmg-read-more a {
	/* Style the read more links */
	color: #0073aa;
	text-decoration: none;
	font-weight: bold;
}
```

### Extending the CLI Command

The CLI commands are built using the WP-CLI framework and can be extended. See `includes/read-more-cli.php` for the implementation.

## Troubleshooting

### Block Not Showing Posts

1. **Check if posts exist**: Use `wp dmg-read-more debug` to see available posts
2. **Verify date range**: Make sure your date range includes published posts
3. **Check post status**: Only published posts are shown

### WP-CLI Command Issues

1. **Database connection error**: Ensure WordPress database is accessible
2. **Command not found**: Verify the plugin is active
3. **DevKinsta specific**: Use `docker exec` with `--allow-root` flag

### Performance Issues

1. **Large datasets**: Use `--limit` parameter to restrict results
2. **Date ranges**: Narrow date ranges for better performance
3. **Export formats**: JSON/CSV formats are more efficient than table for large datasets

## Contributing

This plugin was developed by Josh Hudson Dev. For issues, feature requests, or contributions, please contact the development team.

## License

This plugin is licensed under GPL-2.0-or-later. See the LICENSE file for details.

---

**Version**: 0.1.0  
**Author**: Josh Hudson Dev  
**Text Domain**: gutenberg-read-more
