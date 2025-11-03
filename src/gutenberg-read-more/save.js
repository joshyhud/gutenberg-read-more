import { useBlockProps } from "@wordpress/block-editor";

export default function save({ attributes }) {
	const { selectedPostId, selectedPostTitle, selectedPostPermalink } =
		attributes;

	return (
		<p {...useBlockProps.save()}>
			Read more: <a href={selectedPostPermalink}>{selectedPostTitle}</a>
		</p>
	);
}
