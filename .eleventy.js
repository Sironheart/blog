const path = require('path')
const util = require('util')
const Image = require('@11ty/eleventy-img')

async function imageShortcode(src, alt, sizes = '(min-width: 600px) 600w, 375w') {
    src = this.page?.inputPath ? `${path.dirname(this.page.inputPath)}/${src}` : src

    let metadata = await Image(src, {
        widths: [375, 650],
        formats: ['avif', 'webp', 'jpeg'],
        outputDir: './_site/img/'
    });

    let imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async',
    };

    return Image.generateHTML(metadata, imageAttributes, {
        whitespaceMode: 'inline'
    });
}

module.exports = (eleventyConfig) => {
    eleventyConfig.setUseGitIgnore(false)

    // Watch and copy our source files to trigger a reload of the page
    eleventyConfig.addWatchTarget('src/js/bundle.js')
    eleventyConfig.addWatchTarget('src/css/bundle.css')
    eleventyConfig.addWatchTarget('tailwind.config.js')

    // Copy images
    eleventyConfig.addPassthroughCopy({'src/img': 'img'})
    eleventyConfig.addPassthroughCopy('src/content/articles/**/*.{jpg,jpeg,png,gif,mp4}')

    // Copy fonts
    eleventyConfig.addPassthroughCopy({'src/css/fonts': 'fonts'})
    eleventyConfig.addPlugin(require('eleventy-plugin-torchlight'))
    eleventyConfig.addPlugin(require('@11ty/eleventy-plugin-rss'))

    // Copy favicon
    eleventyConfig.addPassthroughCopy({'src/favicon': '/'})

    eleventyConfig.addShortcode('version', () => {
        return String(Date.now())
    })

    eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

    eleventyConfig.addFilter('limit', (array, limit) => {
        return array.slice(0, limit)
    })

    eleventyConfig.addFilter('readtime', (content) => {
        const wpm = 250
        const wordCount = content.split(' ').length

        return Math.round(wordCount / wpm)
    })

    eleventyConfig.addFilter('formattedDate', (date) => {
        return date.toLocaleDateString('en-gb', {year: 'numeric', month: 'long', day: 'numeric'})
    })

    eleventyConfig.addFilter('console', (value) => {
        const str = util.inspect(value);
        return `<div style="font-family: monospace; white-space: pre-wrap;">${unescape(str)}</div>`
    })

    return {
        markdownTemplateEngine: 'njk',
        dir: {
            input: 'src/content',
            layouts: '_layouts'
        }
    }
}