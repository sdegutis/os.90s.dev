import { Button } from "../views/button.js"
import { Label } from "../views/label.js"

export function ButtonComp(data: {
  action: () => void
  text: string
  style: 'submit' | 'cancel' | undefined
}) {
  const background = data.style === 'submit' ? 0xffffff33 :
    data.style === 'cancel' ? 0x99000099 :
      undefined
  return <Button background={background} padding={2} onClick={data.action}>
    <Label text={data.text} />
  </Button>
}
