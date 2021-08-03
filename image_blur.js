		const r_channel = 0;
		const g_channel = 1;
		const b_channel = 2;
		var standard_kernel_matrix;
		weights_1w_1r = [ [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ -1, 0 ], [ 0, 0 ],
				[ 1, 0 ], [ -1, -1 ], [ 0, -1 ], [ 1, -1 ] ];
		weights_1w_2r = [ [ -2, 2 ], [ -1, 2 ], [ 0, 2 ], [ 1, 2 ], [ 2, 2 ],
				[ -2, 1 ], [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ -2, 0 ],
				[ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ -2, -1 ],
				[ -1, -1 ], [ 0, -1 ], [ 1, -1 ], [ 2, -1 ], [ -2, -2 ],
				[ -1, -2 ], [ 0, -2 ], [ 1, -2 ], [ 2, -2 ] ];
		weights_1w_3r = [ [ -3, 3 ], [ -2, 3 ], [ -1, 3 ], [ 0, 3 ], [ 1, 3 ],
				[ 2, 3 ], [ 3, 3 ], [ -3, 2 ], [ -2, 2 ], [ -1, 2 ], [ 0, 2 ],
				[ 1, 2 ], [ 2, 2 ], [ 3, 2 ], [ -3, 1 ], [ -2, 1 ], [ -1, 1 ],
				[ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ], [ -3, 0 ], [ -2, 0 ],
				[ -1, 0 ], [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 3, 0 ], [ -3, -1 ],
				[ -2, -1 ], [ -1, -1 ], [ 0, -1 ], [ 1, -1 ], [ 2, -1 ],
				[ 3, -1 ], [ -3, -2 ], [ -2, -2 ], [ -1, -2 ], [ 0, -2 ],
				[ 1, -2 ], [ 2, -2 ], [ 3, -2 ], [ -3, -3 ], [ -2, -3 ],
				[ -1, -3 ], [ 0, -3 ], [ 1, -3 ], [ 2, -3 ], [ 3, -3 ] ];

		function openCity(evt, cityName) {
			var i, tabcontent, tablinks;
			tabcontent = document.getElementsByClassName("tabcontent");
			for (i = 0; i < tabcontent.length; i++) {
				tabcontent[i].style.display = "none";
			}
			tablinks = document.getElementsByClassName("tablinks");
			for (i = 0; i < tablinks.length; i++) {
				tablinks[i].className = tablinks[i].className.replace(
						" active", "");
			}
			document.getElementById(cityName).style.display = "block";
			evt.currentTarget.className += " active";

		}

		function handle_variance() {
			var slider = document.getElementById("standard-variance-slider");
			var output = document.getElementById("standard-variance-range");
			output.innerHTML = slider.value;
		}

		function handle_radius() {
			var slider = document.getElementById("radius-slider");
			var output = document.getElementById("radius-range");
			output.innerHTML = slider.value;
		}

		function getImgColorMatrix(pxlData, width, height) {
			var matrix = new Array(height);
			for (var i = 0; i < height; i++) {
				matrix[i] = new Array(width);
				for (var j = 0; j < width; j++) {
					matrix[i][j] = GetPixelColor(pxlData, i, j, width);
				}
			}
			return matrix;
		}

		function GetPixelColor(pxlData, x, y, width) {
			var index = (x * width + y) * 4;
			var pixel = {
				r : pxlData[index],
				g : pxlData[index + 1],
				b : pxlData[index + 2],
				a : pxlData[index + 3]
			};
			return pixel;
		}

		function getChannelMatrix(image_matrix, channel, x, y, radius) {
			var offsets;
			switch (radius) {
			case 1:
				offsets = weights_1w_1r;
				break;
			case 2:
				offsets = weights_1w_2r;
				break;
			case 3:
				offsets = weights_1w_3r;
				break;
			}
			var matrix = new Array(offsets.length);
			for (i = 0; i < matrix.length; i++) {
				var x_offset = parseInt(x) + offsets[i][0];
				var y_offset = parseInt(y) + offsets[i][1];
				switch (channel) {
				case 0:
					matrix[i] = image_matrix[x_offset][y_offset].r;
					break;
				case 1:
					matrix[i] = image_matrix[x_offset][y_offset].g;
					break;
				case 2:
					matrix[i] = image_matrix[x_offset][y_offset].b;
					break;
				}
			}
			return matrix;
		}

		function convolution(kernel_matrix, channel_matrix) {
			let sum = 0;
			for (i = 0; i < kernel_matrix.length; i++) {
				sum += kernel_matrix[i] * channel_matrix[i];
			}
			return Math.round(sum);
		}

		function do_blur(ctx, w, h, kernel_matrix, image_matrix, radius) {
			var imageData = ctx.createImageData(w, h);
			var pxlData = imageData.data;
			for (var i = radius; i < h - radius; i++) {
				var passed_rows = i * 4 * w;
				for (var j = radius; j < w - radius; j++) {
					var passed_cols = 4 * j;
					var rc_matrix = getChannelMatrix(image_matrix, r_channel,
							i, j, radius);
					var gc_matrix = getChannelMatrix(image_matrix, g_channel,
							i, j, radius);
					var bc_matrix = getChannelMatrix(image_matrix, b_channel,
							i, j, radius);
					pxlData[passed_rows + passed_cols] = convolution(kernel_matrix, rc_matrix);
					pxlData[passed_rows + passed_cols + 1] = convolution(kernel_matrix, gc_matrix);
					pxlData[passed_rows + passed_cols + 2] = convolution(kernel_matrix, bc_matrix);
					pxlData[passed_rows + passed_cols + 3] = image_matrix[i][j].a;
				}
			}
			ctx.putImageData(imageData, 0, 0);
		}

		function image_blur() {
			var vslider = document.getElementById("standard-variance-slider");
			var rslider = document.getElementById("radius-slider");
			var variance = vslider.value * vslider.value;			
			var radius = rslider.value;			
			var mycanvas = document.getElementById('canvas');
			var ctx = mycanvas.getContext('2d');
			var imageData = ctx.getImageData(0, 0, mycanvas.width,
					mycanvas.height);
			var pxlData = imageData.data;
			var image_matrix = getImgColorMatrix(pxlData, mycanvas.width,
					mycanvas.height);
			standard_kernel_matrix = getKernelMatrix(radius, variance);
			do_blur(ctx, mycanvas.width, mycanvas.height,
					standard_kernel_matrix, image_matrix, parseInt(radius));
		}

		function preKernelMatrix() {
			standard_kernel_matrix = getKernelMatrix(3, 4);
			//console.log(standard_kernel_matrix);
		}

		function getKernelMatrix(radius, variance) {
			if (radius == 1) {
				return buildKernelMatrix(weights_1w_1r, variance);
			} else if (radius == 2) {
				return buildKernelMatrix(weights_1w_2r, variance);
			} else {
				return buildKernelMatrix(weights_1w_3r, variance);
			}
		}

		function buildKernelMatrix(weights, variance) {
			let sum = 0;
			var kernel_matrix = new Array(weights.length);
			for (i = 0; i < weights.length; i++) {
				var coordinate = weights[i];
				var weight = pointWeight(coordinate[0], coordinate[1], variance);
				sum += weight;
				kernel_matrix[i] = weight;
			}
			return standardize(kernel_matrix, sum);
		}

		function round(value, decimals) {
			return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
		}

		function pointWeight(x, y, variance) {
			var exponent = 0 - ((x * x + y * y) / (2 * variance));
			var weight = Math.exp(exponent) / (2 * Math.PI * variance);
			return weight;
		}

		function standardize(kernel_matrix, sum) {
			for (i = 0; i < kernel_matrix.length; i++) {
				kernel_matrix[i] = round(kernel_matrix[i] / sum, 5);
			}
			return kernel_matrix;
		}