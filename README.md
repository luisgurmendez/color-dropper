## Coding challenge

"Your team needs to create an ability for users to pick a color from canvas.
The task is to build a color dropper."

### Launch and use the app

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

### Test
To run the tests run `yarn test`


### Notes

I added some other features that wheren't in the problem description
such as using the image real size, and using transparency on the colors, because I thought it 
would be a good experiment to see how the solution would perform under more "preassure" (bigger canvas)

#### Code overview

Without getting into too many implementation details, the idea of this solution is to use the canvas api
to get the image data of the canvas. With this data, we can create a color matrix
and build a component that uses this color matrix to draw a grid on top of the canvas that moves
along with the mouse pointer.


#### Optimizing building the ColorMatrix

There are 2 approaches that I could think of when solving this challenge:

1. The first one was to generate an ImageData on mousemove with the bounds of what the ColorDropper
will draw using the `getImageData` function of the canvas context. 
Then build a HexMatrix with this data.

2. The second approach is call `getImageData` once to get the ImageData ( or whenever we draw an image into the canvas),
and when the mouse position changes we can calculate the HexMatrix using this data.


For the first approach, since we use the `getImageData` for the bounds of the sub-square there are
some great benefits regarding off-canvas color calculations. The downsides of this approach
is having to call `getImageData` a lot.. I run some tests since calling `getImageData`
[is not a fast operation](https://stackoverflow.com/a/19502117/5794675),  and it took around
~4ms [see here](/benchmarks/without-willreadfrequently.png) to perform this call.
Altough using the `willReadFrequently` config of the context object gave much better results 
lowering the call to ~0.3ms [see here](/benchmarks/with-willreadfrequently).
With this setting the whole flow of moving the mouse, getting the 
image data, building the HexMatrix and then rendering the `ColorDropper` it takes about ~3.5ms.

The second approach involved working with the ImageData directly, and reading these values
to calculate the HexMatrix everytime the mouse moves. Since the ImageData.data is of type
`Uint8ClampedArray` this is an array that looks something like: [r,g,b,a,r,g,b,a,....,r,g,b,a]
it wasn't too easy to work with, specially when the mouse pointer is near an edge. Besides that
the performance was much better, the whole flow of mousemove and building the HexMatrix, and
then rendering the `ColorDropper` it takes around ~2.6ms [see here](benchmarks/approach2-flow.png). 
The downsides of this approach is that we need to keep the ImageData in memory.

Comparing both approaches, I think the second one is best, not because the performance 
implications ~2.6ms < ~3.5ms, but because the `willReadFrequently` setting is not yet available
in all browsers [Safari](https://bugs.webkit.org/show_bug.cgi?id=244117).


#### Future Optimization: Drawing the Dropper in a canvas
In the future, as a fun test I would like to see how drawing the ColorDropper component inside a canvas
would perform instead of using plain html & css to draw the grid. I noted that using large number
of `<div>`s for the grid is not so great.

Although everything that involves drawing shapes is not as easy as using css,
it would be really hard to maintain!
