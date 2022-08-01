import { describe, test, expect } from "vitest"
import { render, screen, fireEvent } from "@testing-library/vue"

const mouseMove = (x: number, y: number) => {
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent('mousemove', true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);
  fireEvent(event);
  return event;
};

const mouseUp = (x: number, y: number) => {
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);
  document.dispatchEvent(event);
  return event;
};

test('Should only bottomRight is resizable and call onResizeStart when mousedown', async t => {
  const onResizeStart = sinon.spy();
  const resizable = TestUtils.renderIntoDocument<Element>(
    <Resizable
      onResizeStart={onResizeStart}
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
    />,
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  is(divs.length, 3);
  TestUtils.Simulate.mouseDown(ReactDOM.findDOMNode(divs[2]) as Element);
  is(onResizeStart.callCount, 1);
  is(onResizeStart.getCall(0).args[1], 'bottomRight');
});

test('Should not begin resize when onResizeStart returns false', async t => {
  const onResizeStart = () => {
    return false;
  };
  const onResize = sinon.spy();
  const resizable = TestUtils.renderIntoDocument<ResizableProps, Resizable>(
    <Resizable onResizeStart={onResizeStart} onResize={onResize} />,
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const previousState = resizable.state.isResizing;
  TestUtils.Simulate.mouseDown(ReactDOM.findDOMNode(divs[2]) as Element);
  mouseMove(200, 220);
  is(onResize.callCount, 0);
  is(resizable.state.isResizing, previousState);
});

test('should call onResize with expected args when resize direction right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  TestUtils.Simulate.mouseUp(node);
  is(onResize.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof Event);
  is(onResize.getCall(0).args[1], 'right');
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 100);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 0 });
});

test('should call onResize with expected args when resize direction bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  TestUtils.Simulate.mouseUp(node);
  is(onResize.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  is(onResize.getCall(0).args[1], 'bottom');
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 100);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 320);
  t.deepEqual(onResize.getCall(0).args[3], { width: 0, height: 220 });
});

test('should call onResize with expected args when resize direction bottomRight', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  TestUtils.Simulate.mouseUp(node);
  is(onResize.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  is(onResize.getCall(0).args[1], 'bottomRight');
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 320);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 220 });
});

test('should call onResizeStop when resize stop direction right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  mouseUp(200, 220);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResizeStop.getCall(0).args[1], 'right');
  t.deepEqual(onResizeStop.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResizeStop.getCall(0).args[2].clientHeight, 100);
  t.deepEqual(onResizeStop.getCall(0).args[3], { width: 200, height: 0 });
});

test('should call onResizeStop when resize stop direction bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  mouseUp(200, 220);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResizeStop.getCall(0).args[1], 'bottom');
  t.deepEqual(onResizeStop.getCall(0).args[2].clientWidth, 100);
  t.deepEqual(onResizeStop.getCall(0).args[2].clientHeight, 320);
  t.deepEqual(onResizeStop.getCall(0).args[3], { width: 0, height: 220 });
});

test('should call onResizeStop when resize stop direction bottomRight', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      style={{ padding: '40px' }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 220);
  mouseUp(200, 220);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResizeStop.getCall(0).args[1], 'bottomRight');
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 320);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 220 });
});

test('should component size updated when updateSize method called', async t => {
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable defaultSize={{ width: 100, height: 100 }} />,
    document.getElementById('content'),
  );
  resizable.updateSize({ width: 200, height: 300 });
  is(resizable.state.width, 200);
  is(resizable.state.height, 300);
});

test('should snapped by grid value', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      grid={[10, 10]}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(12, 12);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 110);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 110);
  t.deepEqual(onResize.getCall(0).args[3], { width: 10, height: 10 });
});

test('should snapped by absolute snap value', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      snap={{ x: [20, 30], y: [100] }}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(12, 12);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 100);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 30);
  t.deepEqual(onResize.getCall(0).args[3], { width: -70, height: 0 });
});

test('should only snap if the gap is small enough', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 40, height: 40 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      grid={[40, 40]}
      snapGap={10}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 40, clientY: 40 });
  mouseMove(15, 15);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 55);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 55);
  t.deepEqual(onResize.getCall(0).args[3], { width: 15, height: 15 });

  mouseMove(35, 35);
  t.deepEqual(onResize.getCall(1).args[2].clientHeight, 80);
  t.deepEqual(onResize.getCall(1).args[2].clientWidth, 80);
  t.deepEqual(onResize.getCall(1).args[3], { width: 40, height: 40 });
});

test('should clamped by max width', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      maxWidth={200}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 200);
  t.deepEqual(onResize.getCall(0).args[3], { width: 100, height: 0 });
});

test('should clamped by min width', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      minWidth={50}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(-100, 0);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 50);
  t.deepEqual(onResize.getCall(0).args[3], { width: -50, height: 0 });
});

test('should allow 0 as minWidth', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      minWidth={0}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(-100, 0);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 0);
  t.deepEqual(onResize.getCall(0).args[3], { width: -100, height: 0 });
});

test('should clamped by max height', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      maxHeight={200}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 200);
  t.deepEqual(onResize.getCall(0).args[3], { width: 0, height: 100 });
});

test('should clamped by min height', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      minHeight={50}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, -100);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 50);
  t.deepEqual(onResize.getCall(0).args[3], { width: 0, height: -50 });
});

test('should allow 0 as minHeight', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      minHeight={0}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, -100);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 0);
  t.deepEqual(onResize.getCall(0).args[3], { width: 0, height: -100 });
});

test('should aspect ratio locked when resize to right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  mouseUp(200, 0);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 300);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 200 });
});

test('should aspect ratio locked with 1:1 ratio when resize to right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={1 / 1}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  mouseUp(200, 0);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 300);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 200 });
});

test('should aspect ratio locked with 2:1 ratio when resize to right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 200, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={2 / 1}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  mouseUp(200, 0);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 400);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 200);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 100 });
});

test('should aspect ratio locked with 2:1 ratio with extra width/height when resize to right', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 250, height: 150 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={2 / 1}
      lockAspectRatioExtraHeight={50}
      lockAspectRatioExtraWidth={50}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  mouseUp(200, 0);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 450);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 250);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 100 });
});

test('should aspect ratio locked when resize to bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  mouseUp(0, 200);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 300);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 200 });
});

test('should aspect ratio locked with 1:1 ratio when resize to bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={1 / 1}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  mouseUp(0, 200);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 300);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 300);
  t.deepEqual(onResize.getCall(0).args[3], { width: 200, height: 200 });
});

test('should aspect ratio locked with 2:1 ratio when resize to bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 200, height: 100 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={2 / 1}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  mouseUp(0, 200);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 600);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 300);
  t.deepEqual(onResize.getCall(0).args[3], { width: 400, height: 200 });
});

test('should aspect ratio locked with 2:1 ratio with extra width/height when resize to bottom', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 250, height: 150 }}
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
      lockAspectRatio={2 / 1}
      lockAspectRatioExtraHeight={50}
      lockAspectRatioExtraWidth={50}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[4]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  mouseUp(0, 200);
  is(onResizeStop.callCount, 1);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 650);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 350);
  t.deepEqual(onResize.getCall(0).args[3], { width: 400, height: 200 });
});

test('should clamped by parent width', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      bounds="parent"
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(200, 0);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientWidth, 200);
  t.deepEqual(onResize.getCall(0).args[3], { width: 100, height: 0 });
});

test('should clamped by parent height', async t => {
  const onResize = sinon.spy();
  const onResizeStart = sinon.spy();
  const onResizeStop = sinon.spy();
  const resizable = ReactDOM.render<ResizableProps, Resizable>(
    <Resizable
      defaultSize={{ width: 100, height: 100 }}
      bounds="parent"
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    />,
    document.getElementById('content'),
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[7]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  TestUtils.Simulate.mouseDown(node, { clientX: 0, clientY: 0 });
  mouseMove(0, 200);
  t.true(onResize.getCall(0).args[0] instanceof MouseEvent);
  t.deepEqual(onResize.getCall(0).args[2].clientHeight, 200);
  t.deepEqual(onResize.getCall(0).args[3], { width: 0, height: 100 });
});

test('should defaultSize ignored when size set', async t => {
  const resizable = TestUtils.renderIntoDocument<Element>(
    <Resizable defaultSize={{ width: 100, height: 100 }} size={{ width: 200, height: 300 }} />,
  );
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  is(divs.length, 10);
  is(divs[0].style.width, '200px');
  is(divs[0].style.height, '300px');
  is(divs[0].style.position, 'relative');
});

test('should render a handleComponent for right', async t => {
  const CustomComponent = <div className={'customHandle-right'} />;
  const resizable = TestUtils.renderIntoDocument<Element>(<Resizable handleComponent={{ right: CustomComponent }} />);
  if (!resizable || resizable instanceof Element) return t.fail();
  const divs = TestUtils.scryRenderedDOMComponentsWithTag(resizable, 'div') as HTMLDivElement[];
  const node = ReactDOM.findDOMNode(divs[3]);
  if (!node || !(node instanceof HTMLDivElement)) return t.fail();
  const handleNode = node.children[0];
  is(node.childElementCount, 1);
  is(handleNode.getAttribute('class'), 'customHandle-right');
});
