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
import { useState, useMemo, useEffect } from "@wordpress/element";
import { useEntityRecords } from "@wordpress/core-data";

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

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const perPage = 10;

	// Query posts with pagination + search
	const {
		records: posts = [],
		isResolving,
		hasResolved,
		totalPages = 1,
		totalItems = 0,
		error,
	} = useEntityRecords(
		"postType",
		"post",
		useMemo(
			() => ({ per_page: perPage, page, search }),
			[perPage, page, search],
		),
	);

	// Reset to first page when search changes
	useEffect(() => {
		setPage(1);
	}, [search]);

	const onSelectPost = (post) => {
		setAttributes({
			selectedPostId: post.id,
			selectedPostTitle: post.title?.rendered || "(no title)",
			selectedPostPermalink: post.link,
		});
	};

	const Pager = () => (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				marginTop: 8,
			}}
		>
			<div>
				<Button
					variant="secondary"
					onClick={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page <= 1 || isResolving}
				>
					‹ Prev
				</Button>
			</div>
			<div>
				<span style={{ opacity: 0.8 }}>
					Page {page} / {Math.max(1, totalPages)} ({totalItems} items)
				</span>
			</div>
			<div>
				<Button
					variant="secondary"
					onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
					disabled={page >= (totalPages || 1) || isResolving}
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
					<div
						style={{ display: "flex", flexDirection: "column", gap: "16px" }}
					>
						<TextControl
							label="Search posts"
							value={search}
							onChange={setSearch}
							placeholder="Type to filter by title/content"
						/>

						{error && (
							<Notice status="error" isDismissible={false}>
								{error.message || "Error loading posts."}
							</Notice>
						)}

						{isResolving && !hasResolved ? (
							<Spinner />
						) : (
							<>
								<div style={{ border: "1px solid #ddd", borderRadius: "4px" }}>
									{(posts || []).map((post, index) => (
										<div
											key={post.id}
											style={{
												padding: "12px",
												borderBottom:
													index < posts.length - 1 ? "1px solid #ddd" : "none",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
											}}
										>
											<div>
												<strong
													dangerouslySetInnerHTML={{
														__html: post.title?.rendered || "(no title)",
													}}
												/>
												<div style={{ fontSize: 12, opacity: 0.7 }}>
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
									))}
								</div>
								<Pager />
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
