"use client";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type TourDriveStep = {
  element: string;
  title: string;
  description: string;
};

export function driveTour({
  steps,
  onAdvance,
  onFinish,
}: {
  steps: TourDriveStep[];
  onAdvance?: () => void;
  onFinish: () => void;
}): () => void {
  const ready = steps.filter((step) => document.querySelector(`[data-tour="${step.element}"]`));
  if (ready.length === 0) return () => {};

  let handedOff = false;
  let finished = false;
  let tearingDown = false;

  const destroy = () => {
    if (tearingDown) return;
    tearingDown = true;
    tour.destroy();
  };

  const finish = () => {
    if (handedOff || finished) return;
    finished = true;
    onFinish();
    destroy();
  };

  const last = ready.length - 1;
  const tour = driver({
    nextBtnText: "Siguiente",
    prevBtnText: "Atrás",
    doneBtnText: "Listo",
    onCloseClick: () => finish(),
    onDestroyStarted: () => {
      if (handedOff || finished) {
        destroy();
        return;
      }
      finish();
    },
    steps: ready.map((step, index) => ({
      element: `[data-tour="${step.element}"]`,
      popover: {
        title: step.title,
        description: step.description,
        ...(index === last
          ? {
              onNextClick: () => {
                if (!onAdvance) {
                  finish();
                  return;
                }
                handedOff = true;
                onAdvance();
              },
              ...(onAdvance ? { nextBtnText: "Siguiente" } : {}),
            }
          : {}),
      },
    })),
  });

  tour.drive();
  return () => {
    handedOff = true;
    destroy();
  };
}
