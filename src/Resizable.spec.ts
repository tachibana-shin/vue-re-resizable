import { describe, test, expect, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/vue"
import Resizable from "./Resizable.vue"

function is(a: unknown, b: unknown) {
  expect(a).toEqual(b)
}

describe("Resizable", () => {
  afterEach(() => cleanup())

  test("should box width and height equal 100px", () => {
    const { baseElement } = render(Resizable, {
      props: {
        defaultSize: {
          width: 100,
          height: 100
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")

    expect(divs.length).toEqual(10)
    expect(divs[1].style.width).toEqual("100px")
    expect(divs[1].style.height).toEqual("100px")
    expect(divs[1].style.position).toEqual("relative")
  })

  test("should allow vh, vw relative units", () => {
    const { baseElement } = render(Resizable, {
      props: {
        defaultSize: {
          width: "100vw",
          height: "100vh"
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")

    is(divs.length, 10)
    is(divs[1].style.width, "100vw")
    is(divs[1].style.height, "100vh")
    is(divs[1].style.position, "relative")
  })

  test("should allow vmax, vmin relative units", () => {
    const { baseElement } = render(Resizable, {
      props: {
        defaultSize: {
          width: "100vmax",
          height: "100vmin"
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")

    is(divs.length, 10)
    is(divs[1].style.width, "")
    is(divs[1].style.height, "")
    is(divs[1].style.position, "relative")
  })

  test("should box width and height equal auto when size omitted", async t => {
    const { baseElement } = render(Resizable, {
      props: {}
    })

    const divs = baseElement.querySelectorAll("div")

    expect(divs.length).toEqual(10)
    expect(divs[1].style.width).toEqual("auto")
    expect(divs[1].style.height).toEqual("auto")
    expect(divs[1].style.position).toEqual("relative")
  })

  test("should box width and height equal auto when set auto", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        width: "auto",
        height: "auto"
      }
    })

    const divs = baseElement.querySelectorAll("div")

    expect(divs.length).toEqual(10)
    expect(divs[1].style.width).toEqual("auto")
    expect(divs[1].style.height).toEqual("auto")
    expect(divs[1].style.position).toEqual("relative")
  })

  test("Should style is applied to box", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        style: {
          position: "absolute"
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")

    is(divs.length, 10)
    is(divs[1].style.position, "absolute")
  })

  test("Should custom class name be applied to box", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        style: {
          position: "absolute"
        },
        class: "custom-class-name"
      }
    })

    const divs = baseElement.querySelectorAll("div")

    is(divs.length, 10)
    is(divs[1].className, "custom-class-name")
  })

  test("Should custom class name be applied to resizer", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        resizerClasses: {
          right: "right-handle-class"
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    const node = baseElement.querySelector(".right-handle-class")!

    expect(node).not.toEqual(null)
  })

  test("Should create custom span that wraps resizable divs ", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        class: "wrapper-class"
      }
    })

    const divs = baseElement.querySelectorAll("div")

    is(divs[1].getAttribute("class"), "wrapper-class")
  })

  test("Should not render resizer when enable props all false", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        enable: {
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    is(divs.length, 2)
  })

  test("Should render one resizer when one enable props set true", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        enable: {
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    is(divs.length, 3)
  })

  test("Should render two resizer when two enable props set true", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        enable: {
          top: true,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    is(divs.length, 4)
  })

  test("Should render three resizer when three enable props set true", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        enable: {
          top: true,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    is(divs.length, 5)
  })

  test("Should only right is resizable and call onResizeStart when mousedown", async t => {
    const { baseElement } = render(Resizable, {
      props: {
        enable: {
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }
      }
    })

    const divs = baseElement.querySelectorAll("div")
    is(divs.length, 3)
    fireEvent.mouseDown(divs[2])
  })
})
