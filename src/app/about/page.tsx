import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Shirt, SocialFollow, badgeNeon, button, headline } from "@/components/site/shared";

export const metadata: Metadata = { title: "About – T-Drop Monthly T-Shirts" };

export default function AboutPage() {
  return (
    <>
      <section className="site-container flex flex-row">
        <div className="flex w-1/2 flex-col max-lg:w-full">
          <div className="flex flex-col gap-10 pt-10 max-lg:items-center max-lg:text-center">
            <h1 className={headline}>Какво е <br />T-drop?</h1>
            <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
              Услугата T-drop е месечен абонамент за тениска по предварително избрана категория от потребителя. Всеки месец подбираме 4-5 различни категории от които можете да си изберете.
            </p>

            <div className="relative mt-20 flex w-full flex-col gap-10 pt-10 max-lg:items-center">
              <h2 className={headline}>Избираш твоята тема</h2>
              <div className={`${badgeNeon} left-[202px] top-[34px] w-1/2 rotate-[5deg] md:max-lg:left-[51px] md:max-lg:top-[-11px] md:max-lg:w-[139px] max-md:left-[78px] max-md:top-[-28px] max-md:w-[179px]`}>как?</div>
              <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
                От страницата за поръчка си избираш темата, размера, цвета и за удобство можеш да отбележиш за кой е...
              </p>
              <Link href="/join" className={`${button} self-start max-lg:self-center`}>ЗАпиши се сега</Link>

              <div className="relative mt-20 flex w-full flex-col justify-end gap-10 pt-10 max-lg:items-center">
                <h2 className={headline}>След това...</h2>
                <div className={`${badgeNeon} left-[-117px] top-[11px] w-1/2 -rotate-[8deg] md:max-lg:left-[10px] md:max-lg:top-[12px] md:max-lg:w-[182px] max-md:left-[69px] max-md:top-[-24px] max-md:w-[179px]`}>и ся кво?</div>
                <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">
                  ... ще е момента на попълване на информация за доставка и платежен метод. Работим на месечен абонамент, като можете веднъж да се запишете и да получавате случайна тематика или да изберете от индивидуалният мейл, който изпращаме всеки месец чрез който можете да изберете, коя тема си избирате за следващия дроп( можете и през профила също) .
                </p>
                <div className="flex w-full flex-row items-end justify-center max-md:mt-[60px]">
                  <p className="mb-[15px] md:max-lg:w-[60%] max-md:w-[80%]">Избирането се прави веднъж месеца и нямате право да смяна на избора.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-1/2 flex-col max-lg:hidden">
          <div className="sticky top-[120px] flex flex-row items-center justify-center">
            <Image src="/wp/2025/12/shapeA.svg" alt="" width={270} height={188} className="absolute left-[195px] top-[211px] w-[270px]" />
            <div className="w-[32%] shrink-0">
              <Shirt className="rotate-[9deg] scale-[1.3]" />
            </div>
            <div className="z-[2] w-[35%]" />
          </div>
        </div>
      </section>

      <section className="site-container mt-[120px] flex flex-row gap-10 max-lg:flex-col-reverse">
        <div className="relative flex w-full flex-col justify-end gap-10 pt-10 max-lg:items-center">
          <h2 className={`${headline} text-center`}>а Кога ще получа?</h2>
          <div className={`${badgeNeon} left-[308px] top-[-13px] w-[9.141%] rotate-[5deg] md:max-lg:left-[23px] md:max-lg:top-[186px] md:max-lg:w-[164px] max-md:left-[-11px] max-md:top-[1px] max-md:w-[179px]`}>кога?</div>
        </div>
      </section>

      <section className="site-container my-20 flex flex-col items-center">
        <p className="w-[90%] text-center font-dot text-[52px] leading-[1.12] max-lg:w-[80%] max-md:text-[21px]">
          Остават <br /><b>12:24:10:035</b><br /> до следващия дроп
        </p>
      </section>

      <section className="site-container flex flex-row gap-10 md:max-lg:flex-col-reverse max-md:flex-col">
        <div className="flex w-[49.658%] flex-row items-start max-lg:w-full max-lg:flex-col max-lg:items-center">
          <p className="mb-[15px] md:max-lg:w-[60%] max-lg:text-center max-md:w-[80%]">На тази дата изпращаме пратките, като самия ден в който пристига пратка зависи от куриерската фирма.</p>
        </div>
        <div className="flex flex-1 flex-row items-start justify-center max-md:mt-[60px]">
          <p className="mb-[15px] md:max-lg:w-[60%] max-lg:text-center max-md:w-[80%]">С времето ще работим да подобрим процеса, и да измислим начин в който да получавате в деня в който е маркиран дропа.</p>
        </div>
      </section>

      <div className="mt-[120px]">
        <SocialFollow text="Последвай ни за още" smallOnPhones />
      </div>
    </>
  );
}
