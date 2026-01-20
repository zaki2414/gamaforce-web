import Hero from "@/components/home/Hero";
import AboutPreview from "@/components/home/AboutPreview";
import SubteamPreview from "@/components/home/SubteamPreview";
import AchievementsPreview from "@/components/home/AchievementsPreview";
import SponsorsHero from "@/components/home/SponsorsHero";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <SubteamPreview />
      <AchievementsPreview />
      <SponsorsHero />
    </>
  );
}
