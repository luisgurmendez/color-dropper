### Picsart coding challenge

"Your team needs to create an ability for users to pick a color from canvas.
The task is to build a color dropper."

## Launch and use the app

1. Ensure you have a node version `^16.13.0` installed, run `node --version`, if this is not the case,
   then try using `nvm` or a similar tool to switch to a compatible version
   for instance:  `nvm install 16.13.0` then `nvm use 16.13.0`
2. Install the dependencies running `yarn` 
3. Build the app with `yarn build`
4. Run `yarn start` to serve the app locally
5. Open your browser of choice and go to `localhost:3000`

Use the images in the `public/assets/` folder (or add your owns through the file input button) 
to play with different image types, and use the "Use transparency" and "Use real image size"
configs to unlock different behaviors.

## Test
To run the tests run `yarn test`


## Notes

## Optimization: Reading ImageData
    Calling `2dContext.getImageData` [is not a fast operation](https://stackoverflow.com/a/19502117/5794675)
    to be called regularly, an optimization can be done by getting the ImageData once and calculating the
    dropper's color matrix on mouse move, a performance test was done in branch `lg/preload-image-data-perf`.
    It was detected that for BIG images (such as the `mountains.jpg` ~5Mb) calculating the colorMatrix 
    beforehand was a really expensive task, so for this use case 
    (specially with the use real image size setting on) I opt to call `getImageData` on mousemove
    with the dropper's size instead. Using the `willReadFrequently` config of the context object
    gave great results.


## Future Optimization: Drawing the Dropper in a canvas
    In the future, as a fun test I would like to see how drawing the ColorDropper component inside a canvas
    would perform instead of using plain html & css to draw the grid. I noted that using large number
    of `<div>`s for the grid is not so great.
    
    Although everything that involves drawing shapes is not as easy as using css,
    it would be really hard to maintain!
