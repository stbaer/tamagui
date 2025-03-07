import { HeaderIndependent } from '@components/Header'
import { TitleAndMetaTags } from '@components/TitleAndMetaTags'
import { authors } from '@data/authors'
import { getAllFrontmatter } from '@lib/mdx'
import { ChevronRight } from '@tamagui/lucide-icons'
import { format, parseISO } from 'date-fns'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { ScrollView } from 'react-native'
import {
  Button,
  H1,
  H2,
  H3,
  H4,
  H5,
  Image,
  Paragraph,
  Separator,
  Spacer,
  XStack,
  YStack,
} from 'tamagui'

import { Card } from '../components/Card'
import { ContainerLarge } from '../components/Container'
import { DiscordIcon } from '../components/DiscordIcon'
import { FlatBubbleCard } from '../components/FlatBubbleCard'
import { GithubIcon } from '../components/GithubIcon'
import { useTint } from '../components/useTint'

export default function Community({ frontmatters }) {
  return (
    <CommunityLayout>
      <TitleAndMetaTags
        title="Community — Tamagui"
        description="Tamagui latest news and discussion."
      />

      <HeaderIndependent />

      <Spacer size="$4" />

      <ContainerLarge space="$4">
        <Spacer />

        <H1 als="center">Community</H1>

        <Spacer />

        <SocialLinksRow />

        <Spacer />

        <XStack $sm={{ flexDirection: 'column' }}>
          <FlatBubbleCard w="50%" $sm={{ w: 'auto' }} ai="center" bw={0}>
            <Button
              bc="transparent"
              boc="$borderColor"
              bw={1}
              mt="$-3"
              tag="a"
              href="/blog"
              size="$6"
              iconAfter={ChevronRight}
              br="$10"
            >
              <H2 cur="pointer" size="$9" ta="center">
                The Blog
              </H2>
            </Button>
            <Spacer />
            <YStack w="100%" space>
              {frontmatters.map((frontmatter) => (
                <NextLink legacyBehavior key={frontmatter.title} href={frontmatter.slug} passHref>
                  <Card bc="transparent" tag="a" p="$4" f={1}>
                    <YStack space="$2">
                      <H3 fontFamily="$silkscreen" size="$6" color="$color" cursor="pointer">
                        {frontmatter.title}
                      </H3>
                      <XStack ai="center" space="$2">
                        <Paragraph cursor="inherit" tag="time" size="$5" theme="alt2" fow="300">
                          {format(parseISO(frontmatter.publishedAt), 'MMMM yyyy')}
                        </Paragraph>
                        <Paragraph cursor="inherit" theme="alt2" size="$4" fow="300">
                          &nbsp;by {authors[frontmatter.by].name}
                        </Paragraph>
                      </XStack>
                    </YStack>
                  </Card>
                </NextLink>
              ))}
            </YStack>
          </FlatBubbleCard>

          <Spacer size="$4" />

          <FlatBubbleCard ai="center" feature bw={0} className="hero-gradient">
            <H2 size="$9" ta="center">
              Design Kit
            </H2>
            <Spacer size="$2" />
            <YStack ai="center" space>
              <H4 size="$5">Figma Design Kit</H4>
              <NextLink
                legacyBehavior
                href="https://www.figma.com/community/file/1125992524818379922"
                passHref
              >
                <YStack
                  target="_blank"
                  rel="noopener noreferrer"
                  tag="a"
                  br="$5"
                  overflow="hidden"
                  bw={0.5}
                  boc="$borderColor"
                >
                  <Image
                    animation="quick"
                    cur="pointer"
                    shac="$shadowColor"
                    shar="$4"
                    hoverStyle={{
                      scale: 1.2,
                      borderColor: '$color',
                    }}
                    o={0.5}
                    width={1466 * 0.25}
                    height={776 * 0.25}
                    src={'/sponsors/design-kit.png'}
                  />
                </YStack>
              </NextLink>
            </YStack>
          </FlatBubbleCard>
        </XStack>

        <Spacer />

        <FlatBubbleCard bw={0.5} space>
          <H3 ta="center">Starter repos</H3>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack py="$2" space="$4">
              <Card
                f={1}
                maw={250}
                jc="center"
                space="$2"
                tag="a"
                href="https://github.com/tamagui/tamagui/tree/master/apps/site"
                target="_blank"
                p="$5"
              >
                <GithubIcon />
                <H4 cursor="pointer" fontFamily="$silkscreen" ls={0}>
                  tamagui.dev
                </H4>
                <Paragraph cursor="pointer" theme="alt2">
                  by nate
                </Paragraph>
              </Card>

              <Card
                f={1}
                maw={250}
                jc="center"
                space="$2"
                tag="a"
                href="https://github.com/ivopr/tamagui-expo"
                target="_blank"
                p="$5"
              >
                <GithubIcon />
                <H4 cursor="pointer" fontFamily="$silkscreen" ls={0}>
                  Tamagui Expo
                </H4>
                <Paragraph cursor="pointer" theme="alt2">
                  by Ivo
                </Paragraph>
              </Card>

              <Card
                f={1}
                maw={250}
                jc="center"
                space="$2"
                tag="a"
                href="https://github.com/dohomi/tamagui-kitchen-sink"
                target="_blank"
                p="$5"
              >
                <GithubIcon />
                <H4 cursor="pointer" fontFamily="$silkscreen" ls={0}>
                  Kitchen Sink with Storybook
                </H4>
                <Paragraph cursor="pointer" theme="alt2">
                  by dohomi
                </Paragraph>
              </Card>
            </XStack>
          </ScrollView>
        </FlatBubbleCard>

        <Spacer />

        <FlatBubbleCard bw={0}>
          <H2 size="$9" color="#fff" ta="center" className="rainbow clip-text">
            Gold Sponsors
          </H2>
        </FlatBubbleCard>

        <XStack space flexWrap="wrap">
          <GoldSponsor
            name="CodingScape"
            link="https://codingscape.com"
            image="/sponsors/coding-scape.png"
            imageWidth={566 * 0.35}
            imageHeight={162 * 0.35}
          />
          <GoldSponsor
            name="Quest Portal"
            link="https://www.questportal.com"
            image="/sponsors/quest-portal.png"
            imageWidth={200 * 0.3}
            imageHeight={200 * 0.3}
          />
          <GoldSponsor
            name="BeatGig"
            link="https://beatgig.com"
            image="/sponsors/beatgig.jpg"
            imageWidth={400 * 0.5}
            imageHeight={84 * 0.5}
          />
        </XStack>

        <Spacer />

        <FlatBubbleCard bw={0}>
          <H2 size="$9" ta="center">
            Individual Sponsors
          </H2>
        </FlatBubbleCard>

        <XStack space flexWrap="wrap">
          <IndividualSponsor name="@barelyreaper" link="https://twitter.com/barelyreaper" />
          <IndividualSponsor name="@pontusab" link="https://twitter.com/pontusab" />
          <IndividualSponsor name="@AntelaBrais" link="https://twitter.com/AntelaBrais" />
          <IndividualSponsor name="Hirbod" link="https://twitter.com/nightstomp" />
        </XStack>
      </ContainerLarge>

      <Spacer size="$10" />
    </CommunityLayout>
  )
}

function GoldSponsor(props: {
  name: string
  link: string
  image: string
  imageWidth: number
  imageHeight: number
}) {
  return (
    <FlatBubbleCard flat p={0}>
      <NextLink legacyBehavior href={props.link} target="_blank">
        <YStack
          ai="center"
          jc="center"
          f={1}
          cursor="pointer"
          target="_blank"
          tag="a"
          p="$8"
          br="$4"
          space
        >
          <Image
            accessibilityLabel={props.name}
            width={props.imageWidth}
            height={props.imageHeight}
            src={props.image}
          />
          <H5 cursor="inherit" als="center" letterSpacing={4} ai="center">
            {props.name}
          </H5>
        </YStack>
      </NextLink>
    </FlatBubbleCard>
  )
}

function IndividualSponsor(props: { name: string; link: string }) {
  return (
    <FlatBubbleCard flat>
      <YStack maxWidth="100%" fs={0} als="center">
        <XStack space="$4" $sm={{ flexDirection: 'column' }}>
          <NextLink legacyBehavior passHref href={props.link}>
            <YStack
              cursor="pointer"
              target="_blank"
              tag="a"
              p="$4"
              br="$4"
              hoverStyle={{ bc: 'rgba(0,0,0,0.1)' }}
              pressStyle={{ bc: 'rgba(0,0,0,0.2)' }}
              space
            >
              <H5 cursor="inherit" als="center" letterSpacing={4} ai="center">
                {props.name}
              </H5>
            </YStack>
          </NextLink>
        </XStack>
      </YStack>
    </FlatBubbleCard>
  )
}

function CommunityLayout({ children }: { children: any }) {
  const { tint } = useTint()
  return <YStack theme={tint}>{useMemo(() => children, [children])}</YStack>
}

export function getStaticProps() {
  const frontmatters = getAllFrontmatter('blog')
  const sortedFrontmatters = frontmatters.sort(
    (a, b) => Number(new Date(b.publishedAt || '')) - Number(new Date(a.publishedAt || ''))
  )
  return { props: { frontmatters: sortedFrontmatters.slice(0, 3) } }
}

const SocialLinksRow = () => {
  return (
    <XStack space="$4" $sm={{ flexDirection: 'column' }}>
      <Card
        width="33.33%"
        jc="center"
        $sm={{ width: 'auto' }}
        space="$2"
        tag="a"
        href="https://twitter.com/tamagui_js"
        target="_blank"
        rel="noopener noreferrer"
        p="$5"
      >
        <svg
          width="30"
          height="31"
          viewBox="0 0 30 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M28.9993 6.50637C27.9673 6.9667 26.8601 7.27923 25.6985 7.4186C26.8851 6.70064 27.796 5.56035 28.2222 4.20468C27.1108 4.87196 25.8823 5.35341 24.5745 5.61525C23.5258 4.48764 22.0341 3.78235 20.3795 3.78235C17.2082 3.78235 14.6343 6.38389 14.6343 9.58936C14.6343 10.0455 14.6845 10.4889 14.7848 10.9113C10.009 10.6705 5.77634 8.35616 2.94345 4.84239C2.45041 5.69972 2.16629 6.69641 2.16629 7.76068C2.16629 9.77519 3.18162 11.5532 4.72341 12.5921C3.78329 12.5626 2.89749 12.3007 2.12033 11.8657C2.12033 11.8911 2.12033 11.9122 2.12033 11.9375C2.12033 14.7502 4.10084 17.0984 6.729 17.6305C6.24849 17.7614 5.73874 17.8332 5.21645 17.8332C4.84458 17.8332 4.48525 17.7952 4.13427 17.7276C4.86547 20.0335 6.98805 21.7144 9.49921 21.7609C7.53123 23.3193 5.05768 24.2484 2.36267 24.2484C1.89888 24.2484 1.44344 24.2188 0.992188 24.1681C3.5326 25.8152 6.55351 26.7781 9.80005 26.7781C20.367 26.7781 26.1456 17.9303 26.1456 10.2566C26.1456 10.0032 26.1414 9.75407 26.1289 9.5049C27.2528 8.68558 28.2264 7.66355 28.9952 6.49792L28.9993 6.50637Z"
              fill="#1d9bf0"
            />
          </g>
          <defs>
            <clipPath id="clip0">
              <rect width="28" height="23" fill="white" transform="translate(1 3.78235)" />
            </clipPath>
          </defs>
        </svg>
        <H4 cursor="pointer" fontFamily="$silkscreen">
          Twitter
        </H4>
        <Paragraph cursor="pointer" theme="alt2">
          Announcements and general updates.
        </Paragraph>
      </Card>
      <Card
        width="33.33%"
        jc="center"
        space="$2"
        $sm={{ width: 'auto' }}
        tag="a"
        href="https://discord.gg/4qh6tdcVDa"
        target="_blank"
        rel="noopener noreferrer"
        p="$5"
      >
        <DiscordIcon />
        {/* TODO this is using $body for other attributes not $silkscreen */}
        <H4 cursor="pointer" fontFamily="$silkscreen">
          Discord
        </H4>
        <Paragraph cursor="pointer" theme="alt2">
          Get involved and get questions answered.
        </Paragraph>
      </Card>
      <Card
        width="33.33%"
        jc="center"
        $sm={{ width: 'auto' }}
        space="$2"
        tag="a"
        href="https://github.com/tamagui/tamagui"
        target="_blank"
        rel="noopener noreferrer"
        p="$5"
      >
        <GithubIcon />
        <H4 cursor="pointer" fontFamily="$silkscreen">
          GitHub
        </H4>
        <Paragraph cursor="pointer" theme="alt2">
          Issues, feature requests, and contributing.
        </Paragraph>
      </Card>
    </XStack>
  )
}
