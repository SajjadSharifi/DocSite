Here's the English version, with the same casual tone:

# Quick Guide: How to Use This Documentation Site

If you're reading this, the app has loaded successfully. I wrote this guide so you can better understand the product's features and learn how to use it in 3 minutes.

This app displays both **Jupyter Notebook** (`.ipynb`) and **Markdown** (`.md`) files. I usually use Markdown because, for documentation like what you're reading right now, it gives me more customization options and Also, I don't necessarily use Python for my projects. I added Jupyter support too so Python folks can be more comfortable and use this awesome tool. So I recommend Markdown, but feel free to use Jupyter as well.

## Adding Images to Markdown Files

1. Go to the `images` folder located at `./docs/images/` (where `./` is your project root).
2. Put your image files there.
   - Note: This folder (`images`) **won't appear in the right-hand section where you can see folders and files**. We hide it to keep the layout clean and avoid showing extra files.
3. In your Markdown file, wherever you want to insert an image, use this pattern:

```markdown
![Custom Name](images/imageName.jpg)
```

You can use PNG, JPG, JPEG, and other common image formats—this was just an example.

For instance, I put a screenshot here:
![اسکرین‌شات](images/1.png)

![Screenshot](images/screenshot.jpg)

### Important: Relative Paths

If your Markdown file is in a subfolder, the path to the image must be relative to that Markdown file. For example:
- Markdown at `docs/guide.md` → image at `docs/images/photo.png` → use `images/photo.png`
- Markdown at `docs/sub/guide.md` → image at `docs/sub/images/photo.png` → use `images/photo.png`
- Markdown at `docs/sub/guide.md` → image at `docs/images/photo.png` → use `../images/photo.png`

## A Note

You don't need to be an expert at writing Markdown. These days AI tools often output Markdown by default. You can take your text from them and paste it into a `.md` file, and just remember to use the image pattern shown above so the images work correctly :-).
Even the copy button in AI chats gives you Markdown, so have fun! :)

### Useful Markdown Features

- **Headings**: Use `#`, `##`, `###`, etc. The app automatically builds an "On This Page" table of contents from your headings, which is visible on the left side of the page.
- **Code blocks**: Use triple backticks with a language name to highlight code, and a copy button is also provided for these sections.
- **Tables**: Standard Markdown tables are supported.
- **Lists**: Both ordered and unordered lists work.

## Jupyter Notebook

You can also add `.ipynb` files to the `docs` folder. They will be rendered like this:
- Markdown cells as HTML
- Code cells with syntax highlighting
- Outputs (text, images, errors) displayed below each cell

## Folder Structure

Put all your documentation inside the `docs` folder. You can create subfolders—they will appear as collapsible sections in the sidebar.

Example:

```
docs/
├── index.md
├── images/
│   └── logo.png
├── guide.md
└── api/
    ├── auth.md
    └── endpoints.md
```

## Handy Tips

- **Search**: Click the search button (or press `Ctrl+K`) to search across all documents. Results show a preview and link directly to the matching line.
- **Changing text direction:** With the buttons at the top of each post (which are hard to miss (●'◡'●)), you can change the direction of your text. For Persian and Arabic texts, it's recommended to set Auto to RTL so that even if you start with English, it stays right-aligned.
- **Dark/Light Theme**: Toggle the theme with the button in the top bar.
- **Responsive**: This app works on mobile, tablet, and desktop. On mobile, use the menus—effort was put into making them :).
- **Hidden Folders**: The `images`, `assets`, `img`, `static`, and `node_modules` folders are hidden from the right-hand section to keep everything clean.

That's it! Enjoy writing your docs, my friend.