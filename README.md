# AeroNotes ✈️🚀

**A Student Blog on Aerospace & Space** — yazar: **Umutcan Bakırcı**

Saf HTML/CSS/JS ile yazılmış, derleme gerektirmeyen statik bir blog. GitHub Pages üzerinde yayınlanır.

## Sayfalar

| Dosya | Açıklama |
|---|---|
| `index.html` | Ana sayfa: öne çıkan yazı, kategoriler, son yazılar |
| `articles.html` | Tüm yazılar + kategori filtresi |
| `post.html?id=...` | Yazı detay sayfası |
| `about.html` | Hakkımda |
| `write.html` | Yeni yazı oluşturma aracı (önizleme + kod üretir) |

## Yeni yazı nasıl eklenir?

1. Sitede sağ üstteki **Write** butonuna tıkla.
2. Başlık, özet, kategori, kapak ve içeriği (Markdown) yaz; sağda önizlemeyi gör.
3. **Copy code** ile kodu kopyala.
4. `js/posts.js` dosyasını aç ve `const POSTS = [` satırının hemen altına yapıştır.
5. Kaydet → commit → push. GitHub Pages birkaç dakika içinde güncellenir.

Bir yazıyı ana sayfada büyük göstermek için ona `featured: true` ekle (diğerinden kaldır).

### Markdown desteği
`## Başlık`, `### Alt başlık`, `**kalın**`, `*italik*`, `` `kod` ``, `- liste`, `1. liste`, `> alıntı`, `[link](https://...)`, `![resim](assets/foto.jpg)`

## Yerelde çalıştırma

`index.html` dosyasına çift tıklaman yeterli. Ya da:

```bash
python -m http.server 8000
```

## Yapı

```
css/style.css     → tüm stiller
js/posts.js       → yazılar ve site ayarları (yazar adı, kategoriler)
js/main.js        → sayfa oluşturma, arama, markdown
assets/           → kapak görselleri
```
