export function capitalizeWords(str: string): string {
  return str
    .split(' ') // Membagi string menjadi array berdasarkan spasi
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Kapitalisasi huruf pertama setiap kata
    .join(' '); // Gabungkan kembali menjadi string
}
