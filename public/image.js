



var img;

      function preload() {
        img = loadImage("https://picsum.photos/200/300");
      }

      function drawHexagon(x, y, radius) {
        beginShape();
        let angle = TWO_PI / 6;
        for (let i = 0; i < 6; i++) {
          let x_i = x + radius * 0.5 * cos(angle * i);
          let y_i = y + radius * 0.5 * sin(angle * i);
          vertex(x_i, y_i);
        }
        endShape(CLOSE);
      }

      function setup() {
        if (img.width > 2000) {
          img.resize(2000, 0);
        }
        if (img.height > 2000) {
          img.resize(0, 2000);
        }
        createCanvas(img.width, img.height);
        pixelDensity(1);
        image(img, 0, 0);
        loadPixels();
        background(255);
        noStroke();

        var size = 20;
        for (var x = 0; x < width; x += size) {
          for (var y = 0; y < height; y += size) {
            var index = (x + y * width) * 4;

            // Advanced black and white filter
            var r = pixels[index];
            var g = pixels[index + 1];
            var b = pixels[index + 2];
            var rgb = (r + g + b) / 3; // Average of RGB values

            if (rgb < 250) {
              // fill(204, 249, 194); // Black
              fill(0); // Black
            } else {
                fill(255); // White
            }

            //normal
            // var radius = map(rgb, 0, 255, size, 3);
            //inverted
            var radius = map(rgb, 255, 0, size, 3);

            if (radius > 6) {
                drawHexagon(x, y, radius);
            }
          }
        }
      }