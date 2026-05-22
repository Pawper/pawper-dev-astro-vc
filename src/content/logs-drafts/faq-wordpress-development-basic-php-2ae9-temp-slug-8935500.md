---
title: "FAQ: WordPress Development & Basic PHP"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["WordPress", "PHP"]
hook: "This FAQ presumes you are familiar with WordPress basics and use Local by Flywheel. This FAQ also..."
series:
  name: "WordPress FAQ"
  part: 2
  total: 3
---

This FAQ presumes you are familiar with WordPress basics and use Local by Flywheel. This FAQ also presumes you are familiar with programming concepts such as variables, functions, data types, conditionals, loops, etc.

## How do I view the files of a WordPress website?
In Local, right-click the site name under Local sites and select **Show Folder**. Go into the folder for the site, then `app/public`.

This is usually as follows:
`C:\Users\<user name>\Local Sites\<site name>\app\public`

You can open this folder in VS Code to work on your project.

## Where do I create a custom theme? How are a custom theme's files structured?
In `wp-content/themes` create a folder for your theme. Create `index.php` and `style.css` files there. The files must be named in this way.

WordPress expects information about the theme to be in at the top of the `style.css` file in a comment:
```css
/*
 Theme Name: Fictional University
 Author: Phillip
 Version: 1.0
*/
```

For the theme thumbnail you need to add a `screenshot.png` file that is 1200px wide by 900px tall.

## What is PHP?
PHP is a server-side scripting language. It is used by WordPress.

## How do I install PHP in WSL?
`sudo apt-get install php`

## How do I prettify/format PHP in VS Code?
The VS Code extension Prettier does not support PHP. Install the [PHP Intelephense extension](https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client). It is free to use this extension to format PHP (<kbd>Alt</kbd><kbd>Shift</kbd><kbd>F</kbd>).

I suggest changing how Intelephense formats braces. Open VS Code settings, then enter `intelephense format braces`. Change the setting to `k&r`.
![Change the setting for Intelephense > Format: Braces to k&r.](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/nf0y4uerjiesha4npncm.png)

## What can go in a PHP file?
PHP files can include PHP and HTML.

## How do I start PHP mode in a .php file?
PHP code is contained in `<?php ?>`. For example:
```php
<?php $myname = 'Phillip'; ?>

<h1>This page is all about <?php echo $myname ?></h1>
```

## How do I end a statement in PHP?
Use a semicolon. Here is an example of a PHP code block with multiple lines:
```php
<?php
echo 2 + 2;
echo 5 * 5;
?>
```

## How do I define a variable in PHP? How do I reference a variable?
There is no keyword to define a variable. You must prefix the variable name with the dollar symbol (`$`). Then to reference it provide the variable name again prefixed with `$`.
```php
<?php
$myname = 'Phillip';
echo $myname;
?>
```

## How do I define a function in PHP? How do I call a function?
It is the same as JavaScript, if you are familiar. Use the function keyword, then the function name with parentheses, then provide the function's code within curly brackets. You call functions the same way as in JavaScript as well:
```php
<?php
function greet($name, $color) {
  echo "<p>Hi, my name is $name and my favorite color is $color.</p>";
}

greet('John', 'blue');
greet('Jane', 'green');
?>
```

## What functions does WordPress provide?
You can find a complete list at the [developer docs](https://developer.wordpress.org/reference/functions/). We will cover several in this FAQ, but a few other important ones are:
* `bloginfo()`: Displays information about the current site
* `site_url()`: Create a link from the project's root URL. You can pass a string to be added onto it.
* `get_theme_file_uri()`: Get the full URI of the relative URI that you pass.
* `get_the_ID()`: Get the ID of the current page.
* `wp_get_post_parent_id()`: Pass a page's ID to get its parent's ID
* `get_permalink()`: Pass a page's ID to get its permalink.
* `get_the_title()`: Pass a page's ID to get its title.
* `the_title()`: Insert the title of the current page.
* `the_content()`: Insert the content of the current page.
* `wp_list_pages()`: Insert an HTML list of linked pages. To customize, pass an associative array.
```php
wp_list_pages(array(
  'title_li' => NULL,
  'child_of' => $findChildrenOf,
  'sort_column' => 'menu_order'
));
```
* `the_author_posts_link()`: Insert the URL of the current post's author's posts listing
* `the_excerpt()`: Insert the excerpt of the current post.
* `the_time()`; Insert the current post's publication time/date. Formatted as a string using specific letters. e.g., `the_time('n.j.y')`.
* `get_the_category_list()`: Get the current post's category list. You can optionally pass a separator.
* `paginate_links();` Get the pagination links. Must be echoed.

Note that in general an formulas that start with `get_` will return the value instead of printing it. So, if you wan to print it, you'll have to `echo` it.

## How do I create an array in PHP? How do I iterate over an array?
Indexed arrays can be created using the `array()` function. Note that indexed arrays in PHP are zero-based. You can iterate over an array using a `while` loop and the `count()` function.
```php
<?php
$names = array('Brad', 'John', 'Jane', 'Meowsalot', 'Barksalot');

$count = 0;

while ($count < count($names)) {
  echo "<li>Hi, my name is $names[$count]</li>";
  $count++;
}
?>
```

## How do I iterate over WordPress posts in PHP?
Create a `while` loop. For the condition you can provide `have_posts()`, a WordPress function that returns true so long as posts remain to be iterated over. Then you can ready each post within the loop using the `the_post()` function. Finally, you can access information using functions like `the_title()`, `the_permalink()` and `the_content()`. Below you can find the famous "WordPress loop".
```php
<?php

while (have_posts()) {
  the_post(); ?>
  <h2><a href="<?php the_permalink() ?>"><?php the_title() ?></a></h2>
  <?php the_content() ?>
  <hr>
<?php }

?>
```

Note that if you click one of the links you will be taken to a page for the particular post. This is not using a separate PHP file; instead it uses the same PHP file. However, since the URL is now pointing to a post, only that single post is provided to the PHP. That is why it still displays the same HTML, just with the single post.

## How do I create PHP specific to the web page for WordPress posts vs the web page for the index?
Create a file named `single.php`.

## How do I create PHP specific to WordPress pages?
Create a file named `page.php`.

## How do I create a global header/footer?
First create `header.php` and `footer.php`, then you have to use the WordPress functions `get_header();` and `get_footer()` within your files (`index.php`, `single.php`, `page.php`).

## How do I create a global header? How do I create the head section of HTML?
First create `header.php`. Within the opening `<html>` tag add the `lang` attirbute using the WordPress function `language_attributes()`. Within the `<head>` section in `header.php`, use the WordPress function `wp_head()` so that WordPress adds its necessary markup. Note that you shouldn't include the closing `</body>` and `</html>` tags in `header.php`. Then you have to use the WordPress functions `get_header();` within your files (`index.php`, `single.php`, `page.php`).
```php
<!DOCTYPE html>
<html <?php language_attributes(); ?> >

<head>
  <meta charset="<?php bloginfo('charset') ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>

<body <?php body_class() ?>>
  <h1>Fictional University</h1>
```

## How do I create a global footer? How do I add the black admin bar to the top of the page.
First create `footer.php`. This file should contain the closing `</body>` and `</html>` tags. Before those closing tags use the WordPress function `wp_footer()` so that WordPress adds its necessary markup (e.g., adding JavaScript files before the end of the page).. Then you have to use the WordPress function `get_footer()` within your files (`index.php`, `single.php`, `page.php`). 
```php
<p>Greetings from footer.php</p>

<?php wp_footer(); ?>
</body>

</html>
```
Note that the above must be done in order to see the black admin bar at the top of the page, as it is added by a WordPress script.

## How do I add CSS?
Create `functions.php`, which is a file for giving instructions to WordPress.

First we need a function to queue up our stylesheet. You can name this function anything. In this function you need to call the WordPress function `wp_enqueue_style()` to queue up a CSS file. For the first argument, pass a nickname for the stylesheet. Then point to the stylesheet; the default stylesheet can be referenced using `get_stylesheet_uri()`. To reference another file, use `get_theme_file_uri()`. You don't need to include both if you don't use one or the other for styles. You can queue up as many stylesheets as you like within the one function.
```php
<?php
function university_files() {
  wp_enqueue_style('default_stylesheet', get_stylesheet_uri());
  wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
  wp_enqueue_style('font-awesome', '//cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
}
?>
```
Then we can add an action using the WordPress function `add_action()`. The hook to pass as the first argument is `'wp_enqueue_scripts'`, which is for adding CSS/JavaScript files. The second argument is the name of our function from above, passed as a string.
```php
<?php
function university_files() {
  wp_enqueue_style('default_stylesheet', get_stylesheet_uri());
  wp_enqueue_style('university_main_styles', get_theme_file_uri('/build/style-index.css'));
  wp_enqueue_style('font-awesome', '//cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
}
}

add_action('wp_enqueue_scripts', 'university_files');
?>
```

## How do I add JavaScript?
In `functions.php`, in your function to queue up files, use the WordPress function `wp_enqueue_script()`. This function takes 5 arguments. The first 2 arguments are the same as `wp_enqueue_style()`: a nickname and the URI. The 3rd argument is an array of dependencies. For example, `array('jquery')`. The 4th argument is a version number, e.g., `'1.0'`. The final 5th argument is whether you want to load it before the closing body tag or at the top. Pass `true` (without quotes) if you want to load it before the closing body tag.

## How do I add titles to pages? How do I add a featured image?
In `functions.php` add a new function. You can name it whatever you want. Within the function, call the WordPress function `add_theme_support()` and pass it the string `'title-tag'` to add a title; pass 'post-thumbnails' to add a featured image.
```php
function university_features() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
}
```
Then add an action, passing `'after_setup_theme'` as the first argument.
```php
add_action('after_setup_theme', 'university_features');
```

## How do I add menu locations?
In `functions.php`, you need to register menus using `register_nav_menu()` within a custom function. This can be the same custom function used to add the title, as `'after_setup_theme'` is the same hook needed. For the arguments for `register_nav_menu()`, the first argument is a string containing a nickname for it, while the second argument is a string containing a human-readable name for it.
```php
function university_features() {
  register_nav_menu('headerMenuLocation', 'Header Menu Location');
  add_theme_support('title-tag');
}

add_action('after_setup_theme', 'university_features');
```
Then in your PHP, use the `wp_nav_menu()` WordPress function to add the menu. You need to pass it an associative array.
```php
wp_nav_menu(array(
  'theme_location' => 'headerMenuLocation'
));
```

## If my blog is not my home page, where do I enter the html?
Create a file named `front-page.php`. The file `index.php` is for the blog listing page.

## How do I mark up a category page or author page?
`archive.php` - you can use functions like `the_archive_title()` and `the_archive_description()` to pull the relevant invormation.

## How do I do a custom query for WordPress?
First, in PHP, create a variable and instantiate a new instance of the `WP_Query()` class. Pass it an associative array with the query options. Be sure to use `wp_reset_postdata()` at the end of your relevant markup.
```php
<?php
$homepagePosts = new WP_Query(array(
  'posts_per_page' => 2
));

while ($homepagePosts->have_posts()) {
  $homepagePosts->the_post(); ?>
  <li><?php the_title(); ?></li>
<?php } wp_reset_postdata();
?>
```

## How do I create a custom post type?
In `wp-content/mu-plugins/` (the mandatory plugins folder) create a `.php` file. You need to register the post type using `register_post_type()` within a custom function. For the arguments for `register_post_type()`, the first argument is a string containing a nickname for the post type, while the second argument is an associative array with configuration options.
```php
function university_post_types() {
  register_post_type('event', array(
    'show_in_rest' => true,
    'supports' => array('title', 'editor', 'excerpt'),
    'rewrite' => array('slug' => 'events'),
    'has_archive' => true,
    'public' => true,
    'labels' => array(
      'name' => 'Events',
      'add_new_item' => 'Add New Event',
      'edit_item' => 'Edit Event',
      'all_items' => 'All Events',
      'singular_name' => 'Event'
    ),
    'menu_icon' => 'dashicons-calendar'
  ));
}
```
Then you need to add an action with `'init'` as the hook for the function.
```php
add_action('init', 'university_post_types');
```
Then in WordPress admin dashboard go to **Settings** -> **Permalinks** and resave to rebuild the permalink structure.

The templating files must be named to match your event name. E.g., `single-event.php`, `archive-event.php`.

## How do I add a custom field to a custom post type?
On the edit screen go into Preferences and enable custom fields.
![Enable custom fields](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/131r08rkufjcltyroc0y.png)

But it's best to use a plugin such as Advanced Custom Fields (ACF) or CMB2 (Custom Metaboxes 2).

## How do I do a custom query of a custom post type?
You have to specify the `'post_type'` and `'meta_key'` for a custom field.
```php
$today = date('Ymd');
$homepageEvents = new WP_Query(array(
  'posts_per_page' => -1,
  'post_type' => 'event',
  'meta_key' => 'event_date',
  'orderby' => 'meta_value_num',
  'order' => 'ASC',
  'meta_query' => array(
    array(
      'key' => 'event_date',
      'compare' => '>=',
      'value' => $today
    )
  )
));
```

## How do I manipulate default URL-based queries?
```php
function university_adjust_queries($query) {
  if (!is_admin() and is_post_type_archive('event') and $query->is_main_query()) {
    $today = date('Ymd');
    $query->set('meta_key', 'event_date');
    $query->set('orderby', 'meta_value_num');
    $query->set('order', 'ASC');
    $query->set('meta_query', array(
      array(
        'key' => 'event_date',
        'compare' => '>=',
        'value' => $today
      )
    ));
  }
}

add_action('pre_get_posts', 'university_adjust_queries');
```
## How do I create pagination for a custom query?
First create your custom query and set the `'paged'` property to get the page from the URL (default to 1).
```php
$today = date('Ymd');
  $pastEvents = new WP_Query(array(
    'paged' => get_query_var('paged', 1),
    'post_type' => 'event',
    'meta_key' => 'event_date',
    'orderby' => 'meta_value_num',
    'order' => 'ASC',
    'meta_query' => array(
      array(
        'key' => 'event_date',
        'compare' => '<',
        'value' => $today
      )
    )
  ));
```
Then configure `paginate_links`:
```php
  echo paginate_links(array(
    'total' => $pastEvents->max_num_pages
  ));
```

## How do I reuse the same HTML templating?
Create a PHP file to host the template part, e.g., `template-parts/event.php`, then include the markup. Next, whenever you want to include the template part, just use `get_template_part()`. E.g., `get_template_part('template-parts/event')`. You don't need to include the extension (`.php`).

## How do I compile JavaScript while Wordpress is running?
Run `npm init -y` in your theme folder, then `npm i @wordpress/scripts`. Add these scripts to `package.json`:
```json
  "scripts": {
    "build": "wp-scripts build",
    "start": "wp-scripts start",
    "dev": "wp-scripts start",
    "devFast": "wp-scripts start",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
Then run `npm run start`. Note that this script only watches `src/index.js` so you can't use a different folder/file name.

## What is the WordPress REST API?
The WP REST API allows any language to use CRUD operations on WordPress content. URLs are used for CRUD operations. The documentation can be found [here](https://developer.wordpress.org/rest-api/).

## How do I pass my WordPress root URL to JavaScript?
In `functions.php`, in the function for the hook `wp_enqueue_scripts`, call the WordPress function `wp_localize_script()`. For the first argument, pass the nickname given to your main JavaScript file. For the second argument, give a nickname to the data you want to pass. For the third argument, pass an associative array; within that associative array you can give `get_site_url()` as a property value.
```php
function university_files() {
  wp_enqueue_script('main-university-js', get_theme_file_uri('/build/index.js'), 
  ...

  wp_localize_script('main-university-js', 'universityData', array(
    'root_url' => get_site_url()
  ));
}

add_action('wp_enqueue_scripts', 'university_files');
```

## How do I create a custom API route?
```php
<?php 

add_action('rest_api_init', 'universityRegisterSearch');

function universityRegisterSearch() {
  register_rest_route('university/v1', 'search', array(
    'methods' => WP_REST_SERVER::READABLE,
    'callback' => 'universitySearchResutls'
  ));
}

function universitySearchResutls() {
  return 'Congratulations, you created a route.';
}

?>
```

## How do I do a WordPress custom query for a search term?
Use the `s` property.
```php
  $professors = new WP_Query(array(
    'post_type' => 'professor',
    's' => sanitize_text_field($data['term'])
  ));
```

## How do I sanitize data?
Use the WordPress function `sanitize_text_field()`.

> Sources / further study:
> https://www.udemy.com/course/become-a-wordpress-developer-php-javascript/
