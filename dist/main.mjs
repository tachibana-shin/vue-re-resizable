import { defineComponent as we, openBlock as A, createElementBlock as J, normalizeClass as me, renderSlot as le, ref as $, computed as V, reactive as de, onMounted as Ee, onBeforeMount as ke, normalizeStyle as oe, unref as He, createCommentVNode as ve, Fragment as Ce, renderList as Ne, createBlock as Le, withCtx as $e } from "vue";
const fe = {
  width: "auto",
  height: "auto"
}, j = (t, r, n) => Math.max(Math.min(t, n), r), ge = (t, r) => Math.round(t / r) * r, _ = (t, r) => new RegExp(t, "i").test(r), Z = (t) => Boolean(
  t.touches && t.touches.length
), _e = (t) => t.clientX !== void 0 && t.clientY !== void 0, pe = (t, r, n = 0) => {
  const a = r.reduce(
    (s, m, z) => Math.abs(m - t) < Math.abs(r[s] - t) ? z : s,
    0
  ), u = Math.abs(r[a] - t);
  return n === 0 || u < n ? r[a] : t;
}, se = (t) => (t = t.toString(), t === "auto" || t.endsWith("px") || t.endsWith("%") || t.endsWith("vh") || t.endsWith("vw") || t.endsWith("vmax") || t.endsWith("vmin") ? t : `${t}px`), q = (t, r, n, a) => {
  if (t && typeof t == "string") {
    if (t.endsWith("px"))
      return Number(t.replace("px", ""));
    if (t.endsWith("%")) {
      const u = Number(t.replace("%", "")) / 100;
      return r * u;
    }
    if (t.endsWith("vw")) {
      const u = Number(t.replace("vw", "")) / 100;
      return n * u;
    }
    if (t.endsWith("vh")) {
      const u = Number(t.replace("vh", "")) / 100;
      return a * u;
    }
  }
  return t;
}, De = (t, r, n, a, u, s, m) => (a = q(a, t.width, r, n), u = q(
  u,
  t.height,
  r,
  n
), s = q(s, t.width, r, n), m = q(
  m,
  t.height,
  r,
  n
), {
  maxWidth: typeof a > "u" ? void 0 : Number(a),
  maxHeight: typeof u > "u" ? void 0 : Number(u),
  minWidth: typeof s > "u" ? void 0 : Number(s),
  minHeight: typeof m > "u" ? void 0 : Number(m)
}), Ae = /* @__PURE__ */ we({
  __name: "Resizer",
  props: {
    direction: null
  },
  emits: ["resize:start"],
  setup(t, { emit: r }) {
    return (n, a) => (A(), J("div", {
      class: me(["resizer", `resizer-${t.direction}`]),
      onMousedown: a[0] || (a[0] = (u) => r("resize:start", u)),
      onTouchstart: a[1] || (a[1] = (u) => r("resize:start", u))
    }, [
      le(n.$slots, "default", {}, void 0, !0)
    ], 34));
  }
});
const Fe = (t, r) => {
  const n = t.__vccOpts || t;
  for (const [a, u] of r)
    n[a] = u;
  return n;
}, Te = /* @__PURE__ */ Fe(Ae, [["__scopeId", "data-v-ab2e16f7"]]), Xe = /* @__PURE__ */ we({
  __name: "Resizable",
  props: {
    grid: null,
    snap: null,
    snapGap: null,
    bounds: null,
    boundsByDirection: { type: Boolean },
    size: null,
    minWidth: null,
    minHeight: null,
    maxWidth: null,
    maxHeight: null,
    lockAspectRatio: { type: [Boolean, Number] },
    lockAspectRatioExtraWidth: null,
    lockAspectRatioExtraHeight: null,
    enable: null,
    resizerStyles: null,
    resizerClasses: null,
    defaultSize: null,
    scale: null,
    resizeRatio: null
  },
  emits: ["resize:start", "resize:stop", "resize"],
  setup(t, { emit: r }) {
    const n = t, a = $(), u = V(
      () => {
        var e;
        return (e = a.value) == null ? void 0 : e.parentNode;
      }
    ), s = V(() => {
      var e;
      return (e = a.value) == null ? void 0 : e.ownerDocument.defaultView;
    }), m = V(() => {
      var i, l, h, v, g, c, p, d;
      const e = (v = (h = (i = n.size) == null ? void 0 : i.width) != null ? h : (l = n.defaultSize) == null ? void 0 : l.width) != null ? v : fe.width, o = (d = (p = (g = n.size) == null ? void 0 : g.height) != null ? p : (c = n.defaultSize) == null ? void 0 : c.height) != null ? d : fe.height;
      return { width: e, height: o };
    }), z = {
      get value() {
        let e = 0, o = 0;
        if (a.value && s.value) {
          const i = a.value.offsetWidth, l = a.value.offsetHeight, h = a.value.style.position;
          h !== "relative" && (a.value.style.position = "relative"), e = a.value.style.width !== "auto" ? a.value.offsetWidth : i, o = a.value.style.height !== "auto" ? a.value.offsetHeight : l, a.value.style.position = h;
        }
        return { width: e, height: o };
      }
    }, ae = "__resizable_base__", ye = () => {
      const e = s.value;
      if (!e)
        return null;
      const o = u.value;
      if (!o)
        return null;
      const i = e.document.createElement("div");
      return i.style.width = "100%", i.style.height = "100%", i.style.position = "absolute", i.style.transform = "scale(0, 0)", i.style.left = "0", i.style.flex = "0 0 100%", i.classList ? i.classList.add(ae) : i.className += ae, o.appendChild(i), i;
    }, be = (e) => {
      const o = u.value;
      !o || o.removeChild(e);
    };
    function ue() {
      if (!u.value)
        return s.value ? {
          width: s.value.innerWidth,
          height: s.value.innerHeight
        } : { width: 0, height: 0 };
      const e = ye();
      if (!e)
        return { width: 0, height: 0 };
      let o = !1;
      const i = u.value.style.flexWrap;
      i !== "wrap" && (o = !0, u.value.style.flexWrap = "wrap"), e.style.position = "relative", e.style.minWidth = "100%", e.style.minHeight = "100%";
      const l = {
        width: e.offsetWidth,
        height: e.offsetHeight
      };
      return o && (u.value.style.flexWrap = i), be(e), l;
    }
    function re(e, o) {
      if (e.value === void 0 || e.value === "auto")
        return "auto";
      if (m.value[o].toString().endsWith("%")) {
        if (e.value.toString().endsWith("%"))
          return e.value.toString();
        const i = ue();
        return `${Number(e.value.toString().replace("px", "")) / i[o] * 100}%`;
      }
      return se(e.value);
    }
    const ze = V(() => {
      const { size: e } = n, o = e && typeof e.width < "u" && !B.value ? se(e.width) : re(y, "width"), i = e && typeof e.height < "u" && !B.value ? se(e.height) : re(R, "height");
      return { width: o, height: i };
    }), B = $(!1), W = $("right"), f = de({
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }), y = $(m.value.width), R = $(m.value.height), K = de({
      height: "100%",
      width: "100%",
      backgroundColor: "rgba(0,0,0,0)",
      cursor: "auto",
      opacity: 0,
      position: "fixed",
      zIndex: 9999,
      top: "0",
      left: "0",
      bottom: "0",
      right: "0"
    }), D = $();
    let Q, S = 1, ee = 0, te = 0, F = 0, T = 0, G = 0, X = 0, ie = 0, ne = 0;
    Ee(() => {
      var o, i;
      const e = s.value.getComputedStyle(a.value);
      y.value = (o = y.value) != null ? o : z.value.width, R.value = (i = R.value) != null ? i : z.value.height, D.value = e.flexBasis !== "auto" ? e.flexBasis : void 0;
    }), ke(() => {
      ce();
    });
    function xe() {
      if (n.bounds === "parent") {
        const e = u.value;
        if (e) {
          const o = e.getBoundingClientRect();
          ee = o.left, te = o.top;
        }
      }
      if (n.bounds && typeof n.bounds != "string") {
        const e = n.bounds.getBoundingClientRect();
        ie = e.left, ne = e.top;
      }
      if (a.value) {
        const { left: e, top: o, right: i, bottom: l } = a.value.getBoundingClientRect();
        F = e, T = i, G = o, X = l;
      }
    }
    function We(e, o) {
      const i = n.scale || 1, l = n.resizeRatio || 1, {
        lockAspectRatio: h,
        lockAspectRatioExtraHeight: v,
        lockAspectRatioExtraWidth: g
      } = n;
      let c = f.width, p = f.height;
      const d = v || 0, w = g || 0;
      return _("right", W.value) && (c = f.width + (e - f.x) * l / i, h && (p = (c - w) / S + d)), _("left", W.value) && (c = f.width - (e - f.x) * l / i, h && (p = (c - w) / S + d)), _("bottom", W.value) && (p = f.height + (o - f.y) * l / i, h && (c = (p - d) * S + w)), _("top", W.value) && (p = f.height - (o - f.y) * l / i, h && (c = (p - d) * S + w)), { newWidth: c, newHeight: p };
    }
    function Re(e, o) {
      const { boundsByDirection: i } = n, l = i && _("left", W.value), h = i && _("top", W.value);
      let v, g;
      if (n.bounds === "parent") {
        const c = u.value;
        c && (v = l ? T - ee : c.offsetWidth + (ee - F), g = h ? X - te : c.offsetHeight + (te - G));
      } else
        n.bounds === "window" ? s.value && (v = l ? T : s.value.innerWidth - F, g = h ? X : s.value.innerHeight - G) : n.bounds && (v = l ? T - ie : n.bounds.offsetWidth + (ie - F), g = h ? X - ne : n.bounds.offsetHeight + (ne - G));
      return v && Number.isFinite(v) && (e = e && e < v ? e : v), g && Number.isFinite(g) && (o = o && o < g ? o : g), { maxWidth: e, maxHeight: o };
    }
    function Se(e, o, i, l) {
      var P, x;
      const {
        lockAspectRatio: h,
        lockAspectRatioExtraHeight: v,
        lockAspectRatioExtraWidth: g
      } = n, c = (P = l.width) != null ? P : 10, p = i.width === void 0 || i.width < 0 ? e : i.width, d = (x = l.height) != null ? x : 10, w = i.height === void 0 || i.height < 0 ? o : i.height, E = v || 0, k = g || 0;
      if (h) {
        const H = (d - E) * S + k, M = (w - E) * S + k, C = (c - k) / S + E, I = (p - k) / S + E, O = Math.max(c, H), b = Math.min(p, M), U = Math.max(d, C), L = Math.min(w, I);
        e = j(e, O, b), o = j(o, U, L);
      } else
        e = j(e, c, p), o = j(o, d, w);
      return { newWidth: e, newHeight: o };
    }
    function he(e, o, i) {
      const l = m.value[i];
      return o.value === "auto" && f[i] === e && (l === void 0 || l === "auto") ? "auto" : e;
    }
    function Me(e, o) {
      if (!s.value)
        return;
      let i = 0, l = 0;
      if (_e(e) ? (i = e.clientX, l = e.clientY) : Z(e) && (i = e.touches[0].clientX, l = e.touches[0].clientY), r("resize:start", {
        event: e,
        direction: o,
        el: a.value
      }) === !1)
        return;
      n.size && (n.size.height !== void 0 && n.size.height !== R.value && (R.value = n.size.height), n.size.width !== void 0 && n.size.width !== y.value && (y.value = n.size.width)), S = typeof n.lockAspectRatio == "number" ? n.lockAspectRatio : z.value.width / z.value.height;
      let h;
      const v = s.value.getComputedStyle(a.value);
      if (v.flexBasis !== "auto") {
        const g = u.value;
        g && (Q = s.value.getComputedStyle(g).flexDirection.startsWith("row") ? "row" : "column", h = v.flexBasis);
      }
      xe(), Be(), f.x = i, f.y = l, f.width = z.value.width, f.height = z.value.height, B.value = !0, K.cursor = s.value.getComputedStyle(e.target).cursor || "auto", W.value = o, D.value = h;
    }
    function N(e) {
      var i, l;
      if (!B.value || !a.value)
        return;
      const o = {
        width: z.value.width - f.width,
        height: z.value.height - f.height
      };
      r("resize:stop", {
        event: e,
        direction: W.value,
        el: a.value,
        delta: o
      }), n.size && (((i = n.size) == null ? void 0 : i.width) !== void 0 && (y.value = n.size.width), ((l = n.size) == null ? void 0 : l.height) !== void 0 && (y.value = n.size.height)), ce(), B.value = !1, K.cursor = "auto";
    }
    function Y(e) {
      var I, O;
      if (!B.value || !s.value)
        return;
      if (s.value.TouchEvent && Z(e))
        try {
          e.preventDefault(), e.stopPropagation();
        } catch {
        }
      let { maxWidth: o, maxHeight: i, minWidth: l, minHeight: h } = n;
      const v = Z(e) ? e.touches[0].clientX : e.clientX, g = Z(e) ? e.touches[0].clientY : e.clientY, c = ue(), p = De(
        c,
        s.value.innerWidth,
        s.value.innerHeight,
        o,
        i,
        l,
        h
      );
      o = p.maxWidth, i = p.maxHeight, l = p.minWidth, h = p.minHeight;
      let { newHeight: d, newWidth: w } = We(v, g);
      const E = Re(o, i);
      (I = n.snap) != null && I.x && (w = pe(w, n.snap.x, n.snapGap)), (O = n.snap) != null && O.y && (d = pe(d, n.snap.y, n.snapGap));
      const k = Se(
        w,
        d,
        { width: E.maxWidth, height: E.maxHeight },
        { width: l, height: h }
      );
      if (w = k.newWidth, d = k.newHeight, n.grid) {
        const b = ge(w, n.grid[0]), U = ge(d, n.grid[1]), L = n.snapGap || 0;
        w = L === 0 || Math.abs(b - w) <= L ? b : w, d = L === 0 || Math.abs(U - d) <= L ? U : d;
      }
      const P = {
        width: w - f.width,
        height: d - f.height
      };
      let x = w;
      const H = y.value;
      H && typeof H == "string" && (H.endsWith("%") ? x = `${x / c.width * 100}%` : H.endsWith("vw") ? x = `${x / s.value.innerWidth * 100}vw` : H.endsWith("vh") && (x = `${x / s.value.innerHeight * 100}vh`));
      let M = d;
      const C = R.value;
      C && typeof C == "string" && (C.endsWith("%") ? M = `${M / c.height * 100}%` : C.endsWith("vw") ? M = `${M / s.value.innerWidth * 100}vw` : C.endsWith("vh") && (M = `${M / s.value.innerHeight * 100}vh`)), y.value = he(x, y, "width"), R.value = he(M, R, "height"), Q === "row" ? D.value = y.value : Q === "column" && (D.value = R.value), r("resize", {
        event: e,
        direction: W.value,
        el: a.value,
        delta: P
      });
    }
    function Be() {
      s.value && (s.value.addEventListener("mouseup", N), s.value.addEventListener("mousemove", Y), s.value.addEventListener("mouseleave", N), s.value.addEventListener("touchmove", Y, {
        capture: !0,
        passive: !1
      }), s.value.addEventListener("touchend", N));
    }
    function ce() {
      s.value && (s.value.removeEventListener("mouseup", N), s.value.removeEventListener("mousemove", Y), s.value.removeEventListener("mouseleave", N), s.value.removeEventListener("touchmove", Y, !0), s.value.removeEventListener("touchend", N));
    }
    return (e, o) => (A(), J("div", {
      ref_key: "resizable",
      ref: a,
      style: oe({
        position: "relative",
        userSelect: B.value ? "none" : "auto",
        ...He(ze),
        maxWidth: t.maxWidth,
        maxHeight: t.maxHeight,
        minWidth: t.minWidth,
        minHeight: t.minHeight,
        boxSizing: "border-box",
        flexShrink: 0,
        flexBasis: D.value
      })
    }, [
      B.value ? (A(), J("div", {
        key: 0,
        style: oe(K)
      }, null, 4)) : ve("", !0),
      le(e.$slots, "default"),
      t.enable ? (A(!0), J(Ce, { key: 1 }, Ne(Object.entries(t.enable).filter(([i, l]) => l), ([i]) => {
        var l, h;
        return A(), Le(Te, {
          key: i,
          direction: i,
          "onResize:start": (v) => Me(v, i),
          style: oe((l = t.resizerStyles) == null ? void 0 : l[i]),
          class: me((h = t.resizerClasses) == null ? void 0 : h[i])
        }, {
          default: $e(() => [
            le(e.$slots, `resizer-${i}`)
          ]),
          _: 2
        }, 1032, ["direction", "onResize:start", "style", "class"]);
      }), 128)) : ve("", !0)
    ], 4));
  }
});
export {
  Xe as Resizable
};
