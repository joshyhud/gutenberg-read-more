<?php
// This file is generated. Do not modify it manually.
return array(
	'gutenberg-read-more' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/gutenberg-read-more',
		'version' => '0.1.0',
		'title' => 'Gutenberg Read More',
		'category' => 'widgets',
		'icon' => 'links',
		'description' => 'A Gutenberg react block plugin to allow users to search for and create hyperlink readmore text for blog posts',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'attributes' => array(
			'selectedPostId' => array(
				'type' => 'number',
				'default' => 0
			),
			'selectedPostTitle' => array(
				'type' => 'string',
				'default' => ''
			),
			'selectedPostPermalink' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'textdomain' => 'gutenberg-read-more',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js'
	)
);
