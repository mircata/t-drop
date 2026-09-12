import Image from "next/image";
import Link from "next/link";
import { Shirt, SocialFollow, badgeDot, badgeNeon, badgeRed, button, buttonWhite, headline, headline36, subheadline } from "@/components/site/shared";

/*
 * Landing page. Positions and sizes are taken from the WordPress reference at 1440px
 * (reference/screenshots/wp/home-1440.jpeg). The 1280px container starts at x=73 there,
 * so every absolute offset below is relative to that container.
 */

const USPS = [
  { icon: "/wp/2025/12/shirt-icon.svg", h: 96, title: <>Дълготрайни<br /> щампи</>, text: "Използваме доказана технология за отпечатването." },
  { icon: "/wp/2025/12/3ts-icon.svg", h: 82, title: "Високо-качествени тениски", text: "Всичките ни тениски са от 100% памук." },
  { icon: "/wp/2025/12/nonai-icon.svg", h: 114, title: "Не използва AI", text: "Всеки месец наемаме артисти, които рисуват дизайните." },
  { icon: "/wp/2025/12/bulgarian-brand-icon.svg", h: 90, title: "Работим изцяло в бг", text: "Цялото производство е позиционирано в България." },
];

const REVIEWS = [
  { rotate: "-rotate-[4deg]", w: 480, h: 580, aspect: "aspect-[480/580]", badge: `${badgeNeon} left-[-65px] top-[405px] w-1/2 rotate-[14deg] md:max-lg:left-[-35px] md:max-lg:top-[181px] md:max-lg:w-full max-md:left-[-11px] max-md:top-[275px] max-md:w-[179px]` },
  { rotate: "rotate-0", w: 600, h: 800, badge: `${badgeRed} left-[247px] top-[389px] w-1/2 rotate-[14deg] md:max-lg:left-[51px] md:max-lg:top-[-19px] md:max-lg:w-full max-md:left-[11px] max-md:top-[327px] max-md:w-[140px]` },
  { rotate: "rotate-[4deg]", w: 600, h: 800, badge: `${badgeNeon} left-[-49px] top-[333px] w-1/2 rotate-[14deg] md:max-lg:left-[40px] md:max-lg:top-[171px] md:max-lg:w-full max-md:left-[169px] max-md:top-[337px] max-md:w-[139px]` },
];

const FAQ = [
  { q: "Какво получаваш?", a: "Оригинална тениска за всеки повод по твой избор." },
  { q: "Кога ще получа пратката?", a: "Всеки месец обявяваме датата за получаване в най-горната лента на сайта ни поне седмица преди пристигане и пускаме таймер в социалните ни мрежи. В рамките на 5 работни дни след тази дата пратката трябва да е при Вас." },
  { q: "Как да се запишеш?", a: "Регистрацията е проста, ще ни трябва само имена, имейл, и адрес, на които да доставяме всеки месец пратката.", cta: "От тук" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero: 517px tall on desktop */}
      <section className="site-container flex flex-row max-lg:flex-col max-md:px-5">
        <div className="flex w-1/2 flex-col gap-5 pt-10 max-lg:w-full max-lg:items-center max-lg:text-center">
          <h1 className={headline}>Всеки месец различни дизайни</h1>
          <p className="md:max-lg:w-[60%] max-md:w-[80%]">Само за 17.99EU на месец</p>
          <Link href="/join" className={`${button} mt-3.5 self-start max-lg:self-center`}>ВИЖ ТЕНИСКИТЕ</Link>
        </div>

        <div className="relative flex h-[517px] w-1/2 flex-row flex-nowrap items-center max-lg:h-auto max-lg:w-full max-md:mt-[60px]">
          <Image src="/wp/2025/12/shapeA.svg" alt="" width={640} height={445} className="absolute left-[-10px] top-[26px] z-[1] w-full translate-x-[37px] scale-90 md:max-lg:left-[-267px] md:max-lg:top-[6px] md:max-lg:w-[30%] md:max-lg:translate-x-[99px] max-md:left-[-93px] max-md:top-[-61px] max-md:w-full max-md:scale-50" />
          <Image src="/wp/2025/12/shapeB.svg" alt="" width={241} height={237} className="absolute left-[399px] top-[402px] z-[1] w-[241px] translate-x-[37px] md:max-lg:left-[125px] md:max-lg:top-[218px] md:max-lg:w-[29%] max-md:left-[99px] max-md:top-[135px] max-md:w-[276px]" />
          <div className="w-[32%] shrink-0 md:max-lg:w-[233px] max-md:w-[38%]">
            <Shirt className="-rotate-[9deg] scale-[1.3] max-lg:scale-[0.8]" />
          </div>
          <div className="z-[2] flex-1 max-md:w-[36%] max-md:flex-none">
            <Shirt className="scale-[1.5] md:max-lg:scale-100 max-md:scale-[1.5]" />
          </div>
          <div className="flex-1 max-md:w-[32%] max-md:flex-none">
            <Shirt className="rotate-[9deg] scale-[1.3] max-lg:scale-[0.8]" />
          </div>
        </div>
      </section>

      {/* Fabric: shirt on top of the illustrated background (bg.svg) */}
      <section
        className="site-container relative mt-40 flex flex-col items-center bg-[url('/wp/2025/12/bg.svg')] bg-[length:96%_auto] bg-center bg-no-repeat max-lg:mt-[120px] max-lg:bg-cover"
      >
        <div className="relative z-[2] w-[30%] max-md:w-full">
          <Shirt className="w-full rotate-[4deg] scale-[0.8] md:max-lg:scale-[1.1] max-md:scale-[0.7]" />
          <div className={`${badgeRed} left-[-148px] top-[306px] w-[257px] rotate-[9deg] md:max-lg:left-[-187px] md:max-lg:top-[186px] max-md:left-[13px] max-md:top-[367px]`}>Удобна за всеки повод</div>
          <div className={`${badgeNeon} left-[279px] top-[217px] w-1/2 -rotate-[4deg] md:max-lg:left-[178px] md:max-lg:top-[-2px] md:max-lg:w-[242px] max-md:left-[-9px] max-md:top-[84px]`}>100% Памук</div>
          <div className={`${badgeDot} left-[259px] top-[424px] w-1/2 rotate-[14deg] md:max-lg:left-[143px] md:max-lg:top-[244px] md:max-lg:w-[268px] max-md:left-[110px] max-md:top-[265px]`}>ЕКО Материя</div>
        </div>
      </section>

      {/* USP row: 1140px container, four equal columns */}
      <section className="mx-auto mt-20 flex w-full max-w-[1140px] flex-row pb-[54px] pt-10 max-lg:flex-wrap max-lg:items-center max-lg:justify-center md:max-lg:gap-x-[15px] md:max-lg:gap-y-[54px] max-md:gap-[54px] max-md:px-5">
        {USPS.map((u, i) => (
          <div key={i} className="flex flex-1 flex-col items-center max-lg:flex-none md:max-lg:w-[45%] max-md:w-full">
            <Image src={u.icon} alt="" width={114} height={u.h} className="w-[40%] max-lg:w-auto md:max-lg:h-[150px] max-md:h-[130px]" />
            <h3 className={`${subheadline} mt-5 text-center text-t-red`}>{u.title}</h3>
            <p className="mt-5 text-center">{u.text}</p>
          </div>
        ))}
      </section>

      {/* Reviews heading with the two neon shapes */}
      <section className="site-container relative mt-40">
        <h2 className={`${headline36} relative z-[2] text-center`}>Доволни клиенти</h2>
        <Image src="/wp/2025/12/shapeB.svg" alt="" width={150} height={148} className="absolute left-[99px] top-[-50px] z-[1] w-[150px] translate-x-[37px] max-md:left-[178px] max-md:top-[27px] max-md:w-[105px]" />
        <Image src="/wp/2025/12/shapeA.svg" alt="" width={150} height={104} className="absolute left-[1043px] top-[5px] z-[1] w-[150px] translate-x-[37px] max-md:left-[-41px] max-md:top-[-40px]" />
      </section>

      {/* Review cards: 1140px container, gap 80 */}
      <section className="mx-auto mt-20 flex w-full max-w-[1140px] flex-row gap-20 pb-[27px] max-lg:max-w-[678px] max-md:flex-col max-md:gap-0">
        {REVIEWS.map((r, i) => (
          <div key={i} className={`relative z-[2] flex flex-1 flex-col ${r.rotate} max-md:p-5`}>
            <Shirt w={r.w} h={r.h} aspect={r.aspect} className="w-full max-md:scale-[0.8]" />
            <div className={r.badge}>Георги</div>
            <p className="mt-7 max-md:mt-0">“Перфектна тениска за ежедневието”</p>
          </div>
        ))}
      </section>

      {/* FAQ: red band, 60px padding */}
      <section className="site-container relative my-40 flex flex-col items-center justify-center bg-t-red pb-[74px] pt-[60px] max-lg:px-10 max-md:pb-[60px]">
        <h2 className={`${headline36} relative z-[2] w-full text-left text-white`}>Често задавани въпроси</h2>
        <div className="mt-5 flex w-full flex-row gap-20 text-white max-lg:mt-10 max-lg:flex-col md:max-lg:gap-[14px] max-md:gap-[54px]">
          {FAQ.map((f, i) => (
            <div key={i} className="flex flex-1 flex-col">
              <h3 className={subheadline}>{f.q}</h3>
              <p className="mt-5">{f.a}</p>
              {f.cta && (
                <Link href="/join" className={`${buttonWhite} mt-[34px] self-start`}>{f.cta}</Link>
              )}
            </div>
          ))}
        </div>
        <Image src="/wp/2025/12/line2.svg" alt="" width={289} height={131} className="absolute left-[1063px] top-[500px] z-[1] w-[289px] max-lg:left-[303px] max-lg:top-[821px]" />
        <Image src="/wp/2025/12/star2.svg" alt="" width={200} height={202} className="absolute left-[72px] top-[-77px] z-[1] w-[120px] md:max-lg:left-[139px] md:max-lg:top-[-123px] max-md:left-[93px] max-md:top-[-129px]" />
      </section>

      {/* Call to action: 25% / 50% / 25% columns */}
      <section className="site-container my-40 flex flex-row items-center">
        <div className="relative w-1/4 -rotate-[4deg] max-lg:hidden">
          <Shirt className="relative z-[2] w-full" />
          <Image src="/wp/2025/12/shapeB.svg" alt="" width={160} height={158} className="absolute left-[119px] top-[-89px] z-[1] w-[160px]" />
        </div>
        <div className="flex w-1/2 flex-col items-center max-lg:w-full">
          <h2 className="w-[80%] text-center font-headline text-[29px] uppercase leading-[1.12] tracking-[0.84px] text-t-red max-md:w-[80%]">
            Запиши се сега, ако си задаваш следните въпроси:
          </h2>
          <div className="mt-5 flex h-[121px] w-[80%] items-center justify-center text-center font-dot text-[21px] uppercase tracking-[0.84px] text-t-black max-md:text-[14px]">
            искам нещо лежерно за фитнеса
          </div>
          <Link href="/join" className={`${button} mt-5`}>ЗАпиши се сега</Link>
        </div>
        <div className="relative w-1/4 rotate-[9deg] max-lg:hidden">
          <Shirt className="relative z-[2] w-full" />
          <Image src="/wp/2025/12/shapeA.svg" alt="" width={164} height={127} className="absolute left-[110px] top-[382px] z-[1] w-[164px]" />
        </div>
      </section>

      <SocialFollow text="Последвай ни за новини и оферти" />
    </>
  );
}
