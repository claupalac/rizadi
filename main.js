gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, ScrollTrigger);

CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");

// Default duration -20 % (×0.8) across the board
gsap.defaults({ ease: "main", duration: 0.56 });


function initScrollReveal() {
  const logo      = document.querySelector(".intro__logo");
  const textBlock = document.querySelector(".intro__text-block");
  const scrollCue = document.querySelector(".intro__scroll-cue");
  const navBtn    = document.querySelector("[data-sidenav-button]");

  if (!logo) return;

  /* ── Entry animation (speeds: original × 0.8) ── */
  gsap.set([logo, textBlock, scrollCue], { autoAlpha: 0 });

  gsap.timeline({ delay: 0.2 })
    // logo: 1.1 → 0.88
    .to(logo, { autoAlpha: 1, duration: 0.88, ease: "power3.out" })
    .from(logo, { y: 50,  duration: 0.88, ease: "power3.out" }, "<")
    // text: 0.9 → 0.72
    .to(textBlock, { autoAlpha: 1, duration: 0.72, ease: "power2.out" }, "-=0.52")
    .from(textBlock, { y: 30, duration: 0.72, ease: "power3.out" }, "<")
    // scroll cue: 0.6 → 0.48
    .to(scrollCue, { autoAlpha: 1, duration: 0.48, ease: "power2.out" }, "-=0.28");

  /* ── Nav colour: dark on light sections, light on dark sections ── */
  if (navBtn) {
    // Sections with dark bg → button turns light
    ["#proyectos", "#servicios"].forEach(sel => {
      ScrollTrigger.create({
        trigger: sel,
        start: "top 30%",
        onEnter:     () => navBtn.classList.add("is--light"),
        onLeaveBack: () => navBtn.classList.remove("is--light"),
      });
    });
    // Returning to light sections (nosotros, contacto) → button turns dark
    ["#nosotros", "#contacto"].forEach(sel => {
      ScrollTrigger.create({
        trigger: sel,
        start: "top 30%",
        onEnter:     () => navBtn.classList.remove("is--light"),
        onLeaveBack: () => navBtn.classList.add("is--light"),
      });
    });
  }

  /* ── Nosotros: animate in on scroll ── */
  gsap.timeline({
    scrollTrigger: {
      trigger: "#nosotros",
      start: "top 70%",
      toggleActions: "play none none reset",
    }
  })
  .from(".nosotros__eyebrow", { x: -25, autoAlpha: 0, duration: 0.55 })
  .from(".nosotros__heading",  { x: -45, autoAlpha: 0, duration: 0.7  }, "-=0.35")
  .from(".nosotros__rule",     { scaleX: 0, transformOrigin: "left", autoAlpha: 0, duration: 0.45 }, "-=0.3")
  .from(".nosotros__text",     { y: 28, autoAlpha: 0, duration: 0.6, stagger: 0.18 }, "-=0.25");

  /* ── Servicios: stagger cards in on scroll ── */
  gsap.timeline({
    scrollTrigger: {
      trigger: "#servicios",
      start: "top 70%",
      toggleActions: "play none none reset",
    }
  })
  .from(".servicios__heading", { y: -22, autoAlpha: 0, duration: 0.55 })
  .from(".servicios__card",    { y: 38, autoAlpha: 0, duration: 0.6, stagger: 0.1  }, "-=0.3");

  /* ── Contacto: animate in on scroll ── */
  gsap.timeline({
    scrollTrigger: {
      trigger: "#contacto",
      start: "top 70%",
      toggleActions: "play none none reset",
    }
  })
  .from(".contacto__heading", { x: -45, autoAlpha: 0, duration: 0.7 })
  .from(".contacto__right > *", { y: 28, autoAlpha: 0, duration: 0.6, stagger: 0.15 }, "-=0.4");
}

/* ─────────────────────────────────────────────────────────────────
   2.  DRAGGABLE INFINITE SLIDER
   ───────────────────────────────────────────────────────────────── */
function initDraggableInfiniteGSAPSlider() {
  const wrapper = document.querySelector('[data-slider="list"]');
  if (!wrapper) return;

  const slides       = gsap.utils.toArray('[data-slider="slide"]');
  const nextButton   = document.querySelector('[data-slider-button="next"]');
  const prevButton   = document.querySelector('[data-slider-button="prev"]');
  const totalElement = document.querySelector('[data-slide-count="total"]');
  const stepElement  = document.querySelector('[data-slide-count="step"]');
  const stepsParent  = stepElement?.parentElement;

  let activeElement;
  const totalSlides = slides.length;

  if (totalElement)
    totalElement.textContent = totalSlides < 10 ? `0${totalSlides}` : totalSlides;

  if (stepsParent && stepElement) {
    stepsParent.innerHTML = '';
    slides.forEach((_, i) => {
      const clone = stepElement.cloneNode(true);
      clone.textContent = i + 1 < 10 ? `0${i + 1}` : (i + 1);
      stepsParent.appendChild(clone);
    });
  }
  const allSteps = stepsParent
    ? stepsParent.querySelectorAll('[data-slide-count="step"]')
    : [];

  const mq = window.matchMedia('(min-width: 992px)');
  let useNextForActive = mq.matches;
  mq.addEventListener('change', (e) => {
    useNextForActive = e.matches;
    if (currentEl) applyActive(currentEl, currentIndex, false);
  });

  let currentEl    = null;
  let currentIndex = 0;

  function resolveActive(el) {
    return useNextForActive ? (el.nextElementSibling || slides[0]) : el;
  }

  function applyActive(el, index, animateNumbers = true) {
    if (activeElement) activeElement.classList.remove('active');
    const target = resolveActive(el);
    target.classList.add('active');
    activeElement = target;

    if (allSteps.length) {
      if (animateNumbers) {
        // counter: 0.45 → 0.36
        gsap.to(allSteps, { y: `${-100 * index}%`, ease: "power3", duration: 0.36 });
      } else {
        gsap.set(allSteps, { y: `${-100 * index}%` });
      }
    }
  }

  const loop = horizontalLoop(slides, {
    paused: true,
    draggable: true,
    center: false,
    onChange: (element, index) => {
      currentEl    = element;
      currentIndex = index;
      applyActive(element, index, true);
    },
  });

  const mapClickIndex = (i) => useNextForActive ? (i - 1) : i;
  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (slide.classList.contains("active")) return;
      // slide click: 0.725 → 0.58
      loop.toIndex(mapClickIndex(i), { ease: "power3", duration: 0.58 });
    });
  });

  // prev / next: 0.725 → 0.58
  nextButton?.addEventListener("click", () => loop.next({ ease: "power3", duration: 0.58 }));
  prevButton?.addEventListener("click", () => loop.previous({ ease: "power3", duration: 0.58 }));

  if (!currentEl && slides[0]) {
    currentEl    = slides[0];
    currentIndex = 0;
    applyActive(currentEl, currentIndex, false);
  }
}

/* ─── horizontalLoop helper ─────────────────────────────────────── */
function horizontalLoop(items, config) {
  let timeline;
  items  = gsap.utils.toArray(items);
  config = config || {};

  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat,
        onUpdate: onChange && function () {
          let i = tl.closestIndex();
          if (lastIndex !== i) { lastIndex = i; onChange(items[i], i); }
        },
        paused: config.paused,
        defaults: { ease: "none" },
        onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length          = items.length,
      startX          = items[0].offsetLeft,
      times           = [],
      widths          = [],
      spaceBefore     = [],
      xPercents       = [],
      curIndex        = 0,
      indexIsDirty    = false,
      center          = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap            = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
      timeOffset      = 0,
      container       = center === true
        ? items[0].parentNode
        : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        xPercents[length - 1] / 100 * widths[length - 1] -
        startX + spaceBefore[0] +
        items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(), b2;
        items.forEach((el, i) => {
          widths[i]      = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i]   = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
          b2             = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, { xPercent: i => xPercents[i] });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0;
        center && times.forEach((t, i) => {
          times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset);
        });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length, closest = 1e10, index = 0, d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) d = wrap - d;
          if (d < closest) { closest = d; index = i; }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item            = items[i];
          curX            = xPercents[i] / 100 * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop  = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
            .fromTo(item,
              { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) },
              { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false },
              distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true);
      },
      proxy;

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", () => refresh(true));

    function toIndex(index, vars) {
      vars = vars || {};
      (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
          time     = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex)
        time += tl.duration() * (index > curIndex ? 1 : -1);
      if (time < 0 || time > tl.duration()) vars.modifiers = { time: timeWrap };
      curIndex       = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
    }

    tl.toIndex      = (index, vars) => toIndex(index, vars);
    tl.closestIndex = setCurrent => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) { curIndex = index; indexIsDirty = false; }
      return index;
    };
    tl.current  = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
    tl.next     = vars => toIndex(tl.current() + 1, vars);
    tl.previous = vars => toIndex(tl.current() - 1, vars);
    tl.times    = times;
    tl.progress(1, true).progress(0, true);

    if (config.reversed) { tl.vars.onReverseComplete(); tl.reverse(); }

    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1),
          ratio, startProgress, draggable, lastSnap, initChangeX, wasPlaying,
          align     = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
          syncIndex = () => tl.closestIndex(true);

      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying    = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio       = 1 / totalWidth;
          initChangeX = (startProgress / -ratio) - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag:        align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) return lastSnap + initChangeX;
          let time        = -(value * ratio) * tl.duration(),
              wrappedTime = timeWrap(time),
              snapTime    = times[getClosest(times, wrappedTime, tl.duration())],
              dif         = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() { syncIndex(); draggable.isThrowing && (indexIsDirty = true); },
        onThrowComplete: () => { syncIndex(); wasPlaying && tl.play(); },
      })[0];
      tl.draggable = draggable;
    }

    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
  });

  return timeline;
}

/* ─────────────────────────────────────────────────────────────────
   3.  SIDE NAVIGATION WIPE EFFECT
       Durations: ×0.8 across the board
   ───────────────────────────────────────────────────────────────── */
function initSideNavWipeEffect() {
  const navWrap         = document.querySelector("[data-sidenav-wrap]");
  const overlay         = navWrap.querySelector("[data-sidenav-overlay]");
  const menu            = navWrap.querySelector("[data-sidenav-menu]");
  const bgPanels        = navWrap.querySelectorAll("[data-sidenav-panel]");
  const menuToggles     = document.querySelectorAll("[data-sidenav-toggle]");
  const menuLinks       = navWrap.querySelectorAll("[data-sidenav-link]");
  const fadeTargets     = navWrap.querySelectorAll("[data-sidenav-fade]");
  const menuButton      = document.querySelector("[data-sidenav-button]");
  const menuButtonTexts = menuButton.querySelectorAll("[data-sidenav-label]");
  const menuButtonIcon  = menuButton.querySelector("[data-sidenav-icon]");

  let tl = gsap.timeline();

  const openNav = () => {
    navWrap.setAttribute("data-nav-state", "open");
    tl.clear()
      .set(navWrap, { display: "block" })
      .set(menu, { xPercent: 0 }, "<")
      // label swap: stagger unchanged (0.2 is a visual rhythm, not a speed issue)
      .fromTo(menuButtonTexts, { yPercent: 0   }, { yPercent: -100, stagger: 0.2 })
      .fromTo(menuButtonIcon,  { rotate: 0     }, { rotate: 315 }, "<")
      .fromTo(overlay,         { autoAlpha: 0  }, { autoAlpha: 1 }, "<")
      // panels: 0.575 → 0.46
      .fromTo(bgPanels,  { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.46 }, "<")
      .fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.28")
      .fromTo(fadeTargets, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04 }, "<+=0.16");
  };

  const closeNav = () => {
    navWrap.setAttribute("data-nav-state", "closed");
    tl.clear()
      .to(overlay,         { autoAlpha: 0 })
      .to(menu,            { xPercent: 120 }, "<")
      .to(menuButtonTexts, { yPercent: 0   }, "<")
      .to(menuButtonIcon,  { rotate: 0     }, "<")
      .set(navWrap,        { display: "none" });
  };

  menuToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      navWrap.getAttribute("data-nav-state") === "open" ? closeNav() : openNav();
    });
  });

  /* ── Nav link routing: close menu → scroll to section ── */
  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;       // no target — let browser handle it
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Reuse closeNav animation but call scrollIntoView on complete
      navWrap.setAttribute("data-nav-state", "closed");
      tl.clear()
        .to(overlay,         { autoAlpha: 0 })
        .to(menu,            { xPercent: 120 }, "<")
        .to(menuButtonTexts, { yPercent: 0   }, "<")
        .to(menuButtonIcon,  { rotate: 0     }, "<")
        .set(navWrap,        { display: "none" })
        .call(() => target.scrollIntoView({ behavior: "smooth" }));
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navWrap.getAttribute("data-nav-state") === "open") closeNav();
  });
}

/* ─────────────────────────────────────────────────────────────────
   4.  INIT
   ───────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initDraggableInfiniteGSAPSlider();
  initSideNavWipeEffect();
});
