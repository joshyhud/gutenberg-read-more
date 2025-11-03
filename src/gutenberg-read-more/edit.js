/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";

import {
	PanelBody,
	TextControl,
	Button,
	Spinner,
	Notice,
} from "@wordpress/components";
import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const blockProps = useBlockProps({ className: "dmg-read-more" });

	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const perPage = 5;

	// Function to build API path with parameters
	const buildApiPath = (currentPage = page, searchTerm = search) => {
		let path = `/wp/v2/posts?per_page=${perPage}&page=${currentPage}&orderby=date&order=desc`;

		// Handle search - if it's a number, search by ID, otherwise by title/content
		if (searchTerm.trim()) {
			if (!isNaN(searchTerm) && searchTerm.trim() !== "") {
				// Search by specific ID
				path += `&include=${parseInt(searchTerm)}`;
			} else {
				// Search by title/content
				path += `&search=${encodeURIComponent(searchTerm)}`;
			}
		}

		return path;
	};

	// Function to fetch posts
	const fetchPosts = async (currentPage = page, searchTerm = search) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await apiFetch({
				path: buildApiPath(currentPage, searchTerm),
				parse: false, // This allows us to access headers
			});

			const postsData = await response.json();
			const totalPosts = parseInt(response.headers.get("X-WP-Total") || "0");
			const totalPagesCount = parseInt(
				response.headers.get("X-WP-TotalPages") || "1",
			);

			setPosts(postsData);
			setTotalItems(totalPosts);
			setTotalPages(totalPagesCount);
		} catch (err) {
			console.error("Error fetching posts:", err);
			setError(err);
			setPosts([]);
			setTotalItems(0);
			setTotalPages(1);
		} finally {
			setIsLoading(false);
		}
	};

	// Initial load and when page changes
	useEffect(() => {
		fetchPosts();
	}, [page]);

	// When search changes, reset to page 1 and fetch
	useEffect(() => {
		if (page === 1) {
			fetchPosts(1, search);
		} else {
			setPage(1);
		}
	}, [search]);

	const onSelectPost = (post) => {
		setAttributes({
			selectedPostId: post.id,
			selectedPostTitle: post.title?.rendered || "(no title)",
			selectedPostPermalink: post.link,
		});
	};

	const Pager = () => (
		<div className="dmg-read-more-pager">
			<div>
				<Button
					variant="secondary"
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page <= 1 || isLoading}
				>
					‹ Prev
				</Button>
			</div>
			<div>
				<span>
					Page {page} / {Math.max(1, totalPages)} ({totalItems} items)
				</span>
			</div>
			<div>
				<Button
					variant="secondary"
					onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
					disabled={page >= (totalPages || 1) || isLoading}
				>
					Next ›
				</Button>
			</div>
		</div>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title="Browse Posts" initialOpen={true}>
					<div className="post-select-panel">
						<TextControl
							label="Search posts"
							value={search}
							onChange={setSearch}
							placeholder="Search by title, content, or enter post ID"
							help="Enter text to search titles/content, or enter a number to find specific post ID"
						/>

						{error && (
							<Notice status="error" isDismissible={false}>
								{error.message || "Error loading posts."}
							</Notice>
						)}

						{isLoading ? (
							<Spinner />
						) : (
							<>
								<div className="post-list">
									{posts.length > 0 ? (
										posts.map((post, index) => (
											<div className="post-item" key={post.id}>
												<div>
													<strong
														dangerouslySetInnerHTML={{
															__html: post.title?.rendered || "(no title)",
														}}
													/>
													<div className="post-subtext">
														ID: {post.id} •{" "}
														{new Date(post.date).toLocaleDateString()}
													</div>
												</div>
												<Button
													variant={
														attributes.selectedPostId === post.id
															? "primary"
															: "secondary"
													}
													onClick={() => onSelectPost(post)}
												>
													{attributes.selectedPostId === post.id
														? "Selected"
														: "Select"}
												</Button>
											</div>
										))
									) : (
										<div
											style={{
												padding: "20px",
												textAlign: "center",
												color: "#666",
											}}
										>
											{search
												? `No posts found matching "${search}"`
												: "No posts found"}
										</div>
									)}
								</div>
								{posts.length > 0 && <Pager />}
							</>
						)}
					</div>
				</PanelBody>
			</InspectorControls>

			<p {...blockProps}>
				{attributes.selectedPostId ? (
					<>
						Read more:{" "}
						<a href={attributes.selectedPostPermalink}>
							{attributes.selectedPostTitle}
						</a>
					</>
				) : (
					"Please select a post from the sidebar."
				)}
			</p>
		</>
	);
}
