# yl-response

A front end smoothing response solution based on REM(font size of the root element).

# Features

- Set up  with some check points, then gets a smooth curve map from screen width to REM value.
- Real time display of change trend is the current stage.
- Automatically set the REM value and the class names of DOM HTML to replace the media queries.

### Before
```css
@media screen and (max-width:480px){
  html {  font-size: 12px;  }
  .box {  /* specific style code */  }
}
@media screen and (min-width:600px) and (max-width:900px){
  html {  font-size: 24px;  }
  .box {  /* specific style code */  }
}
```

### After
```css
html.xs .box {  /* specific style code */  }
html.sm .box {  /* specific style code */  }
html.md .box {  /* specific style code */  }
```

### Most Important Things

REM in different media query interval is discrete, which may cause style mutation.

Using this tool, we can ensure that this change is smooth.

> We use the Bessel curve to do this job, refer to `transition-timing-function in css3`.

# Import

### Webpack
`npm i yl-responsive`
```javascript
const ylResponsive = require('yl-responsive');
```
### Html
```html
<script src="./lib/index.js"></script>
<script>
  var ylResponsive = window.ylResponsive;
</script>
```

# How to Use

```javascript
const watcher = ylResponsive([
  'sm',
  [960, 40],
  'md',
  [1440, 70],
  'lg',
  [1920, 100],
  'xl',
], {
  demo: true,
  watch: true,
  watchDebounce: 10,
});
```

# DEMO

See `/test/index.html`.

# API

### ylResponsive(params, options)

@param params { Array }

Arrays describing response intervals.
For example:
```javascript
[
  'sm', // When the screen width is less than 900px, stage is 'sm'.
  [960, 40], // When the screen width is 900px, rem is 40px.
  'md', // Stage 'md' when the screen width is between 960px and 1440px.
  [1440, 70], // When the screen width is 1440px, rem is 70px.
  'lg', // Stage name also will be the class name of DOM html.
  [1920, 100], // Another check point.
  'xl', // When the screen width is greater than 900px, stage is 'xl'.
]
```

### @param options { object }

|   Key   |   Description   |   Default Value   |
| ---- | ---- | ---- |
|   monitor   |   Enable monitor. Show the change curve and the current stage. Pretty useful at the development stage. |   false   |
|   watch   |   Enable monitoring of screen size changes. If false, you need to monitor by yourself(use `watcher`).   |   false   |
|   watchDebounce   |   debounce idle of `watch`(unit: ms).   |   20   |

### @return function watcher

You should monitor screen size changes by it.

```javascript
  window.onresize = () => {
    console.log(watcher())
  }
  /* Logs looks like:
  {
    rem: 60.23, // current rem (px)
    width: 1200, // current screen width (px)
    part: {
      color: "rgb(82,148,133)",
      cps: (4) [{…}, {…}, {…}, {…}],
      stage: "md" // current stage name
    }
  }
  */
```
