/**
 * Mengembalikan nilai float acak dalam rentang [0, 1) yang telah dibagi.
 * @param {int} divisorMagnitude Angka untuk dipangkatkan dan kemudian membagi nilai float acak dengan hasil pangkat tersebut.
 * @return {number}
 */
function randFloat(divisorMagnitude) {
  divisorMagnitude += 0.8;
  return (
    Math.random() / (divisorMagnitude * divisorMagnitude * divisorMagnitude)
  );
  //Tanpa melakukan pemangkatan (atau bahkan pangkat tiga), tampilannya sangat kasar dan tidak realistis.
}

/**
 * Mengonversi koordinat 2D (x, y) ke dalam indeks vertex 1D dari 0...(dimensiPanjang^2 - 1).
 * @param {int} x X-index
 * @param {int} y Y-index
 * @param {int} dimLength Panjang kedua dimensi dari sebuah larik 2D, yang seharusnya merupakan bilangan pangkat 2 ditambah 1.
 */
function coordToIndex(x, y, dimLength) {
  return x * dimLength + y; //Contoh: 5x5: (0,3) dipetakan menjadi 3, dan (1,2) dipetakan menjadi 7.
}

/**
 * Menggunakan algoritma Diamond-Square untuk menghasilkan tinggi semua sudut kecuali 4 sudut dari heightGrid, dan membuat larik meshIndices.
 * @param {2D array} heightGrid Sudut-sudut 4 sudut sudah ditetapkan; kita mengubah semua yang lain.
 * @param {int} dimLength Panjang kedua dimensi dari heightGrid, yang seharusnya merupakan bilangan pangkat 2 ditambah 1.
 * @param {1D array} meshIndices Array yang tidak diinisialisasi. dengan panjang 0 yang akan memiliki panjang 3(2*(dimensiPanjang-1)^2); ini adalah jumlah segitiga yang terbentuk/3.
 * @param {int} start Indeks dari elemen awal yang harus kita pertimbangkan; heightGrid[start][start]
 * @param {int} end Indeks dari elemen akhir yang harus kita pertimbangkan; heightGrid[end][end]
 * @param {int} iter Iterasi saat ini yang sedang berlangsung (dimulai dari 1). Menentukan besarnya angka acak.
 */
function diamondSquare(
  heightGrid,
  dimLength,
  meshIndices,
  startX = 0,
  startY = 0,
  endX = dimLength - 1,
  endY = dimLength - 1,
  iter = 1
) {
  var maxIter = Math.log2(dimLength - 1);
  if (iter > maxIter) return; //Kasus dasar; selesai. Kita membagi array (dimLength)x(dimLength) menjadi log2(dimLength-1) - 1 kali.
  var midX = (endX + startX) / 2;
  var midY = (endY + startY) / 2;
  //Jika saya mengambil rata-rata dari semua nilai termasuk yang acak, entah mengapa medan menjadi lebih bergerigi.
  //Diamond Step:
  heightGrid[midX][midY] =
    randFloat(iter) +
    mean(
      new Float32Array([
        /*randFloat(iter), */ heightGrid[startX][startY],
        heightGrid[startX][endY],
        heightGrid[endX][startY],
        heightGrid[endX][endY],
      ]),
      4
    );
  //Square Step 1: Upper
  heightGrid[startX][midY] =
    randFloat(iter) +
    mean(
      new Float32Array([
        heightGrid[startX][startY],
        heightGrid[startX][endY],
        heightGrid[midX][midY],
      ]),
      3
    );
  //Square Step 2: Lower
  heightGrid[endX][midY] =
    randFloat(iter) +
    mean(
      new Float32Array([
        heightGrid[endX][startY],
        heightGrid[endX][endY],
        heightGrid[midX][midY],
      ]),
      3
    );
  //Square Step 3: Left
  heightGrid[midX][startY] =
    randFloat(iter) +
    mean(
      new Float32Array([
        heightGrid[startX][startY],
        heightGrid[endX][startY],
        heightGrid[midX][midY],
      ]),
      3
    );
  //Square Step 4: Right
  heightGrid[midX][endY] =
    randFloat(iter) +
    mean(
      new Float32Array([
        heightGrid[startX][endY],
        heightGrid[endX][endY],
        heightGrid[midX][midY],
      ]),
      3
    );
  //Bentuk jaringan segitiga (hanya indeks di sini) jika kita berada pada subdivisi terkecil: sebuah 3x3.
  if (iter == maxIter) {
    //Kita memiliki 3x3. Bentuk 8 segitiga (24 entri). Ini bisa sedikit disederhanakan dengan loop yang berantakan, tetapi ini lebih mudah dipahami.
    var center = coordToIndex(midX, midY, dimLength);
    //Upper-Top (2):
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX, startY, dimLength));
    meshIndices.push(coordToIndex(startX, startY + 1, dimLength)); //1
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX, startY + 1, dimLength));
    meshIndices.push(coordToIndex(startX, startY + 2, dimLength)); //2
    //Right sides (2):
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX, startY + 2, dimLength));
    meshIndices.push(coordToIndex(startX + 1, startY + 2, dimLength)); //3
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX + 1, startY + 2, dimLength));
    meshIndices.push(coordToIndex(startX + 2, startY + 2, dimLength)); //4
    //Bottom-bottom (2):
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX + 2, startY + 1, dimLength));
    meshIndices.push(coordToIndex(startX + 2, startY + 2, dimLength)); //5
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX + 2, startY, dimLength));
    meshIndices.push(coordToIndex(startX + 2, startY + 1, dimLength)); //6
    //Left sides (2):
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX + 1, startY, dimLength));
    meshIndices.push(coordToIndex(startX + 2, startY, dimLength)); //7
    meshIndices.push(center);
    meshIndices.push(coordToIndex(startX, startY, dimLength));
    meshIndices.push(coordToIndex(startX + 1, startY, dimLength)); //8
  }
  //Lakukan algoritma lagi secara rekursif pada subdivisi 4 persegi, dan tingkatkan nilai iterasi untuk mengurangi magnitudo nilai float acak.
  diamondSquare(
    heightGrid,
    dimLength,
    meshIndices,
    startX,
    startY,
    midX,
    midY,
    iter + 1
  ); //do top-left square
  diamondSquare(
    heightGrid,
    dimLength,
    meshIndices,
    midX,
    startY,
    endX,
    midY,
    iter + 1
  ); //do bottom-left square
  diamondSquare(
    heightGrid,
    dimLength,
    meshIndices,
    startX,
    midY,
    midX,
    endY,
    iter + 1
  ); //do top-right square
  diamondSquare(
    heightGrid,
    dimLength,
    meshIndices,
    midX,
    midY,
    endX,
    endY,
    iter + 1
  ); //do bottom-right square
}

/**
 * Temukan ketinggian maksimum dalam heightGrid, dan bagi semua ketinggian dengan maksimum, sehingga mereka akan <= 1.
 * Kemudian larik vertices dibuat, mengubah indeks [x][y] menjadi nilai yang dinormalisasi dalam (-1, 1).
 * Gunakan ini SETELAH diamondSquare().
 * @param {2D array} heightGrid Array persegi 2D yang kami normalisasi.
 * @param {int} dimLength Panjang kedua dimensi dari heightGrid, yang seharusnya merupakan bilangan pangkat 2 ditambah 1.
 * @param {1D array} meshVertices Array yang tidak diinisialisasi dengan panjang 3 * (dimLength)^2
 * @return {1D array} Array dengan panjang 6 dengan rentang nilai verteks grid; [minX, maxX, minY, ...]
 */
function normalizeGrid(heightGrid, dimLength, meshVertices) {
  var gridRange = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0];
  //1: Temukan ketinggian minimum dan maksimum
  for (var i = 0; i < dimLength; i++) {
    for (var j = 0; j < dimLength; j++) {
      if (heightGrid[i][j] < gridRange[2]) gridRange[2] = heightGrid[i][j]; //new min
      if (heightGrid[i][j] > gridRange[3]) gridRange[3] = heightGrid[i][j]; //new max
    }
  }
  //2: Normalisasi koordinat dan berikan ke buffer verteks jaringan
  var mid = (dimLength - 1) / 2;
  for (var i = 0; i < dimLength; i++) {
    for (var j = 0; j < dimLength; j++) {
      heightGrid[i][j] /= gridRange[3]; //max height
      //Assign ke meshVertices
      var startIndex = 3 * coordToIndex(i, j, dimLength); //3 values per vertex
      meshVertices[startIndex] = (i - mid) / (mid + 1); //Nilai x yang dinormalisasi. Kurangkan pertama kali karena pusat koordinat ada di tengah kanvas.
      meshVertices[startIndex + 2] = (j - mid) / (mid + 1); //normalized z-value
      meshVertices[startIndex + 1] = heightGrid[i][j]; //normalized height (y)
    }
  }
  gridRange[0] = (-1.0 * mid) / (mid + 1);
  gridRange[1] = (dimLength - 1 - mid) / (mid + 1);
  gridRange[2] = gridRange[2] / gridRange[3]; //normalized height
  gridRange[3] = 1.0;
  gridRange[4] = gridRange[0]; //same min bound as X
  gridRange[5] = gridRange[1]; //same max bound as X
  return gridRange;
}

/**
 * Metode Baru yang menggabungkan metode findFaceNormals dan findVertexNormals yang lama menjadi satu dan jauh lebih efisien.
 * Diberikan verteks jaringan dan indeksnya, hitung normal permukaan (face normals) dan gunakan mereka untuk menghitung normal verteks (vertex normals).
 * @param {Array} meshVertices Seharusnya sudah dihitung dalam normalizeGrid().
 * @param {Array} meshIndices Seharusnya sudah dihitung dalam diamondSquare().
 * @param {int} dimLength Panjang kedua dimensi dari heightGrid asli, yang seharusnya merupakan bilangan pangkat 2 ditambah 1.
 * @param {Array} vertexNormals Array yang tidak diinisialisasi dengan panjang 3 * (dimLength)^2.
 */
function findVertexNormals(
  meshVertices,
  meshIndices,
  dimLength,
  vertexNormals
) {
  var numTriangles = 2 * (dimLength - 1) * (dimLength - 1);
  for (var v = 0; v < dimLength * dimLength; v++) {
    //Inisialisasi vertexFaces dan vertexNormals.
    vertexNormals[3 * v] = 0;
    vertexNormals[3 * v + 1] = 0;
    vertexNormals[3 * v + 2] = 0;
  }
  for (var i = 0; i < numTriangles; i++) {
    var v0 = [
      meshVertices[3 * meshIndices[3 * i]],
      meshVertices[3 * meshIndices[3 * i] + 1],
      meshVertices[3 * meshIndices[3 * i] + 2],
    ];
    var v1 = [
      meshVertices[3 * meshIndices[3 * i + 1]],
      meshVertices[3 * meshIndices[3 * i + 1] + 1],
      meshVertices[3 * meshIndices[3 * i + 1] + 2],
    ];
    var v2 = [
      meshVertices[3 * meshIndices[3 * i + 2]],
      meshVertices[3 * meshIndices[3 * i + 2] + 1],
      meshVertices[3 * meshIndices[3 * i + 2] + 2],
    ];
    var curNormal = cross(difference(v2, v0), difference(v1, v0));
    curNormal = normalize(curNormal);
    //vertex normals:
    for (var c = 0; c < 3; c++) {
      //c untuk komponen; x, kemudian y, kemudian z.
      vertexNormals[3 * meshIndices[3 * i] + c] += curNormal[c]; //v0
      vertexNormals[3 * meshIndices[3 * i + 1] + c] += curNormal[c]; //v1
      vertexNormals[3 * meshIndices[3 * i + 2] + c] += curNormal[c]; //v2
    }
  }
  for (var v = 0; v < dimLength * dimLength; v++) {
    //Normalisasi vertexNormals
    var vNorm = normalize([
      vertexNormals[3 * v],
      vertexNormals[3 * v + 1],
      vertexNormals[3 * v + 2],
    ]);
    vertexNormals[3 * v] = vNorm[0];
    vertexNormals[3 * v + 1] = vNorm[1];
    vertexNormals[3 * v + 2] = vNorm[2];
  }
}

/**
 * Hitung rata-rata dari sejumlah angka.
 * @param {array} numbers Angka-angka untuk dihitung rata-ratanya.
 * @param {int} length Berapa banyak angka yang akan dihitung rata-ratanya.
 * @return {number}
 */
function mean(numbers, length) {
  var sum = 0.0;
  for (var i = 0; i < length; i++) {
    sum += numbers[i];
  }
  return sum / length;
}

/**
 * Temukan selisih dua vektor 3-komponen; a - b.
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
function difference(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Bagi vektor a dengan skalar d; a / d.
 * @param {Array} a
 * @param {number} d Divisor
 * @return {Array}
 */
function quotient(a, d) {
  return [a[0] / d, a[1] / d, a[2] / d];
}

/**
 * Temukan produk silang dari dua vektor 3-komponen.
 * @param {Array} a
 * @param {Array} b
 * @return {Array}
 */
function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Temukan norm, atau magnitudo dari vektor a -> ||a||.
 * @param {Array} a
 * @return {number}
 */
function norm(a) {
  var sum = 0.0;
  for (var i = 0; i < a.length; i++) {
    sum += a[i] * a[i];
  }
  return Math.sqrt(sum);
}

/**
 * Temukan norm dari vektor a dan bagi a dengan nilainya; a -> a / ||a||.
 * @param {Array} a
 * @return {Array}
 */
function normalize(a) {
  return quotient(a, norm(a));
}
