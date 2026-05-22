---
title: "FAQ: WordPress Basics"
date: "2026.05.22"
kicker: "Tutorial"
tags: ["WordPress"]
hook: "What is WordPress?   WordPress is a free and open-source content management system built..."
series:
  name: "WordPress FAQ"
  part: 1
  total: 3
---

## What is WordPress?
WordPress is a free and open-source content management system built with PHP and a MySQL or MariaDB database. It features plugins and themes which has made it a popular choice for blogs and websites. Approximately 43% of all websites are made using WordPress.

## Where can I find support/documentation for WordPress?
[developer.wordpress.org](https://developer.wordpress.org) is the official documentation website for WordPress. The support forums are at [wordpress.org/support](https://wordpress.org/support). Another useful website is [wpbeginner.com](https://wpbeginner.com). You can also find support at [wordpress.stackexchange.com](https://wordpress.stackexchange.com).

## How is a WordPress site accessed?
There is the public-facing portion the world accesses, and then there is the administration dashboard that only the website owner or developer can access.

## How are WordPress sites structured?
WordPress is essentially all about pages and posts. It is through creating and modifying these that WordPress is a content management system. Pages and posts are how you implement the raw text data or content of a WordPress site. Creating either is very intuitive; you can do so through the admin dashboard.

## What is the difference between a page and a post?
Pages and posts are similar but there is a difference: a page is an independent entity, while a post is part of a collection, organized into one or more categories.

A page could be an "About Us" page, "Contact" page, "Gallery" page. It is any independent page of evergreen/timeless content. The navigation menu usually links to pages.

A post is part of a collection. Usually posts are accessed through a blog. Posts are time-stamped and sorted with the newest at the top.

## How are WordPress sites styled?
WordPress features a separation of content and presentation. While content is implemented using pages and posts, the design is managed through Themes.

## What is the difference between WordPress.com and WordPress.org?
[WordPress.com](WordPress.com) is a Software-as-a-Service (SaaS) provider of WordPress. It's easy to get started and you can create a free account that will be free for forever. However, you're not in control and the plugins and themes which you can use are limited.

[WordPress.org](WordPress.org) gives the full WordPress experience and gives complete control, allowing any plugin or theme. You can monetize your website, such as adding ads or shopping. You can also write your own custom code. However, WordPress.org does not provide hosting, so you have to find and manage hosting separately (which will cost money).

When most people discuss WordPress in web development, they are usually referring to using it via WordPress.org.

## What is Local? How do I work on WordPress on my machine?
Local is software by Flywheel for installing and managing WordPress locally on your machine in order to work on a WordPress website. It automatically installs PHP, Apache & MySQL.

1. Go to [the Local website](https://localwp.com/).
2. Click the Download button and follow the prompts. You will need to enter your email and phone number. As of February 2021 there is no verification process.
3. Launch the downloader installer and follow the prompts to install Local.
4. Launch the Local application.
5. Click the + button in the lower left corner to create a new local site. You can create as many local projects as you want. The default options are OK but you will need to name the site and each site requires a username, password and email address for accessing the administration dashboard.

## How do I access a WordPress site created through Local?
In Local, click the **Admin** button. It will launch a login screen in your browser, served locally over localhost.

You click the name of the site at the top of the window to go to the frontend version or return to the admin dashboard from there. This link switches back and forth between the frontend & backend.

## How do I stop/start the local server?
You can click **Stop Site** in the top right corner. To restart it, click **Start Site** in the top right corner.

## How do I add different types of content to a page/post? What are blocks and patterns?
Pages/posts are composed of blocks. A block can be a paragraph text, or it can be headings, columns, media & text, gallery, buttons, an embedded YouTube video, a Tweet, spacers, custom HTML, etc. If you are in an empty block and type `/` you can search for the block type you want to insert.

Patterns are blocks with more advanced layouts comprised of multiple components. After selecting a pattern you will replace the default text/images with your own.

Take care to provide alt text for images.

## How do I set a page as a subpage?
While on the screen to edit the page, in the page settings go to **Page Attributes** and select a parent page.

## How do I change the homepage?
By default the homepage is a listing of all blog posts, but you can change it to a different page that you have created.

Go to **Settings** > **Reading** change it from your latest posts to a static page (the one you created). You can also set the posts page, since your home page will no longer host the blog, but this is not necessary.

## How do I create post categories and add posts to categories?
In the post settings you can create categories and add the post to categories.

## How do I assign a featured image / thumbnail for a post so that a theme can place it correctly?
In the post settings go to **Featured Image** and select an image. You can also edit an image.

## How do I add a read more link?
Insert the More block.

## How do I create an excerpt for SEO/social media shares?
In the post settings you can summarize a post by defining the excerpt text.

## How do I customize the permalink URL for posts?
In the admin dashboard go to **Settings** > **Permalinks**.

## How do I customize the pagination / how many posts show per page?
In the admin dashboard go to **Settings** > **Reading**. Change **Blog pages to show at most**.

## What is a theme?
A theme controls the design/appearance of a WordPress site. There are thousands of free themes available. To change the theme go to **Appearance** > **Themes**.

## How do I customize a theme?
Go to **Appearance** > **Customize**. Not all styles in a theme can be customized. There is a menu on the left for accessing customizable styles.
* You can customize the header (logo / site title / tagline) by selecting **Site Identity**.
* Go to **Colors** to customize the overall color scheme, as well as colors for the background, links, main text and secondary text.

Make sure you click **Save & Publish** after making changes.

## How do I add navigation links?
In the dashboard go to **Appearance** > **Menus**. Here you can add pages / categories to a menu. You can also reorder menu items by clicking and dragging, as well as create submenus by dragging items slightly to the right underneath a menu item. Then you can set the menu's display location as the primary menu. Note that different themes have different display locations.

## What is a widget? How do I remove a widget area?
A widget is a dynamic widget, usually in a widget area such as the sidebar, that can be reordered or customized. To customize widgets go to **Appearance** > **Widgets**. Widget areas are added by themes. To remove a widget area, just remove all widgets from it.

## What is a plugin?
A plugin adds new functionality/features to a WordPress site, including new types of widgets, or areas in the admin dashboard. As an example of an added features, to add lightbox/modal functionality for viewing images from a gallery block you can install the WP Featherlight plugin. Another example: to add a contact form you will need to add a plugin such as Contact Form 7, and to save those contact form submission to the WordPress database you'll need Flamingo. Contact Form 7 and Flamingo add sections to the admin dashboard.

Note that there are premium plugins that cost money but offer advanced features. Premium plugins are purchased through 3rd party websites. They provide a downloadable file that can be uploaded to your WordPress site. Note that 3rd party plugins are not reviewed and could potentially be untrustworthy. Some trusted sources are [pippinsplugins.com](pippinsplugins.com) and [elegantthemes.com](elegantthemes.com).

## How do I change my profile information? How do I add a profile photo?
Go to the **Users** > **Profile** section of the admin dashboard. You can input details such as the first name, last name & nickname, as well as how the name is displayed.

If you use the same email for your WordPress administrator account as your Gravatar account, WordPress will find your profile photo. Note that themes may not support avatars.

## How do I add a user account? What are the different permission roles?
In the admin dashboard go to **Users** > **Add New**. WordPress will automatically generate a secure password and send it in an activation email to the provided email address. You can also specify the role of the user.
* Administrator: full access & control. For those with technical skills only.
* Editor: create / edit any post or page.
* Author: create / edit their own posts/pages.
* Contributor: create drafts but cannot publish/edit.
* Subscriber: can only manage their own profile data.

## How do I get to the login screen for the admin dashboard?
After the domain of the site enter `/wp-login.php` or `/wp-admin`.

## Where does Local save test emails?
Local uses MailHog. You can access it through the Local app.

## How does an administrator review and approve comments?
They must go to **Comments** in the admin dashboard.

## How do I change it so every comment must approved? How do I allow all comments without approval?
Go to **Settings** > **Discussion** and find the section for **Before a comment appears**. Select the option for **Comment must be manually approved**. To allow all comments without approval, uncheck all options in this section.

## How do I disable comments and pingbacks/trackbacks?
You can disable comments and pingbacks/trackbacks in a post's settings (under **Discussion**). To disable comments and pingbacks/trackbacks for the entire website, go to **Settings** > **Discussion**. At the top you can uncheck the top 3 options.

## How do I prevent comment spam?
You can sign up for Akismet, which costs money, or use an alternative commenting service like Disqus. There is also the WordPress plugin CleanTalk which comes with free trial.

## How do I export/import my WordPress site?
The easiest way is using the All-in-One WP Migration plugin by ServMask. Note that importing will overwrite all existing data including login information.

> Sources / further learning:
> https://www.udemy.com/course/wordpress-for-beginners-create-a-website-blog-step-by-step/
