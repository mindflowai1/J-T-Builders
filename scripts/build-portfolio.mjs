import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'public/portfolio'
const DEST = 'src/assets/portfolio'

const ALBUMS = {
  basement: ['1/IMG_2584.jpg', '1/IMG_2590.jpg', '1/IMG_2603.jpg', '1/IMG_2605.jpg'],
  garage: ['2/IMG_0293.jpg', '2/IMG_8417.jpg', '2/IMG_8419.jpg', '2/IMG_9667.jpg'],
  addition: ['3/IMG_3297.jpg', '3/IMG_3306.jpg', '3/IMG_6511.jpg', '3/IMG_8866.jpg'],
  renovation: [
    '4/IMG_2070.jpg',
    '4/IMG_5259.jpg',
    '4/IMG_2073.jpg',
    '4/IMG_5270.jpg',
    '4/IMG_6933.jpg',
    '4/IMG_5257.jpg',
  ],
  'pergola-deck': ['5/IMG_0408.jpg', '5/IMG_9786.jpg', '7/IMG_8387.jpg', '7/IMG_8401.jpg'],
  'black-rail-deck': ['6/IMG_3558.jpg', '6/IMG_3563.jpg', '6/IMG_3017.jpg'],
  'cable-rail-deck': [
    '8/IMG_2676.jpg',
    '8/IMG_2672 (1).jpg',
    '8/IMG_2680.jpg',
    '8/IMG_2681 (1).jpg',
    '8/IMG_2682.jpg',
  ],
  'porch-demo': ['9/IMG_5955.jpg', '9/IMG_5978.jpg', '9/IMG_5953.jpg', '9/IMG_5974.jpg'],
  'elevated-deck': ['10/IMG_4541.jpg', '10/IMG_6033.jpg', '10/IMG_6050.jpg'],
}

for (const [album, files] of Object.entries(ALBUMS)) {
  const outDir = path.join(DEST, album)
  await mkdir(outDir, { recursive: true })
  for (let i = 0; i < files.length; i++) {
    const inPath = path.join(SRC, files[i])
    const outPath = path.join(outDir, `${i + 1}.webp`)
    await sharp(inPath).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(outPath)
    console.log(`${album}/${i + 1}.webp  <-  ${files[i]}`)
  }
}
console.log('done')
