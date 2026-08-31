import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPalette, type ColorPaletteProps } from "./ColorPalette";

const meta = {
  title: "Foundations/Color",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function renderPalette(props: ColorPaletteProps) {
  return function ColorStory() {
    return <ColorPalette {...props} />;
  };
}

export const Atomic: Story = {
  render: renderPalette({
    prefix: "--atomic-",
    title: "Atomic",
    description:
      "색의 정체만 담은 팔레트입니다. 컴포넌트에서는 semantic을 쓰세요. 스와치를 클릭하면 토큰 이름을 복사합니다.",
  }),
};

export const Semantic: Story = {
  render: renderPalette({
    prefix: "--semantic-",
    title: "Semantic",
    description: "역할에 따라 정의된 색입니다. 스와치를 클릭하면 토큰 이름을 복사합니다.",
  }),
};
