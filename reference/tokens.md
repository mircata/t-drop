# Design tokens from the WordPress site

Source: Elementor "Default Kit" (post 6) and the hello-elementor custom CSS (post 268) in the backup. These are the values the Next.js port must reproduce.

## Colors

| Kit name | Hex | Used for |
|---|---|---|
| T Red (primary) | #CC0E45 | buttons, accents, checked radios |
| T White (secondary) | #FFFFFF | |
| T Black (text) | #212121 | body text |
| T Neon (accent) | #CEFF58 | button hover background |
| T Teal (custom, misnamed) | #FFFEF9 | page background, button text |
| Purple (inline on landing) | #833CA3 | landing sections |
| Light grey | #EAEAEA | radio and form backgrounds |
| Near black | #020101 | inline on landing |

Body background: #FFFEF9. Mobile browser theme color: #FFFEF9.

## Typography (Google Fonts)

| Kit role | Family | Weight | Size | Extras |
|---|---|---|---|---|
| Headline | Dela Gothic One | 400 | 72px | uppercase, line-height 112% |
| Subheadline | Dela Gothic One | 400 | 21px | uppercase, letter-spacing 0.84px |
| Paragraph | Handjet | 400 | 24px | letter-spacing 4% |
| Small headline | Roboto | 500 | | |
| Decorative | DotGothic16 | | | footer and one landing block |

Body: font-family Handjet, line-height 1.8em (custom CSS).

## Buttons

Background #CC0E45, text #FFFEF9, radius 50px, padding 25px 40px, Dela Gothic One 21px uppercase, letter-spacing 0.84px. WooCommerce primary button: radius 60px, padding 20px 40px, 28px, hover black text on #CEFF58.

## Layout

Container width 1280px, container padding 0, widget gap 0. Breakpoints: tablet below 1025px, mobile below 768px. Page template: elementor_header_footer (theme header and footer replaced by Elementor Header #82 and Footer #357).

## Site identity

Name: T-Drop Monthly T-Shirts. Tagline: Свежи тениски всеки месец на вратата ти. Logo: uploads/2025/12/cs.png. Locale bg_BG. Footer copyright: All rights reserved.

## Page map (WordPress id, slug)

| Page | id | Built with |
|---|---|---|
| Landing (front page) | 15 | Elementor |
| About | 154 | Elementor |
| ЗАПИСВАНЕ (join) | 102 | classic content + WooCommerce checkout |
| Register | 314 | Elementor |
| My account | 103 / 501 | WooCommerce shortcode / Your Profile (Elementor) |
| Cart | 101 | classic content + template part 182 |
| Checkout | 178 | WooCommerce shortcode |
| Payment Confirmation | 571 | classic content |
| Payment Failed | 572 | classic content |
| Header | 82 | Elementor theme builder |
| Footer | 357 | Elementor theme builder |

Plugin leftovers, not ported: Sample Page (2), prodajba (566), ShopWP Products (569), ShopWP Collections (570), SUB (575).
