//"use client"

  //import { useEffect, useRef, useState } from "react";
  import TrustedCompanies from "@/components/landingPage/section2";
import Section3 from "@/components/landingPage/section3";
import Section4 from "@/components/landingPage/section4";
import TestimonialSlider from "@/components/landingPage/section5";
import BlogSection from "@/components/landingPage/section6";
import Section1 from "@/components/landingPage/section1";
import Section8 from "@/components/landingPage/section8";
 


type HomeProps = {
  params: Promise<{ locale: string }>;
};


export default async function Home({ params }: HomeProps) {


  const { locale } = await params;




  return (
    <div className="w-full fc ">
      <div className="w-full fc flex-col max-w-full">


        {/*   section 1   */}

        
        <Section1 locale={locale === "kr" ? "kr" : "en"} />


        <TrustedCompanies/>


        <Section3/>


        <Section4/>


        <TestimonialSlider/>


        <BlogSection/>


        {/*<Section7/>*/}


        <Section8/>


      </div>

    </div>
  );
}