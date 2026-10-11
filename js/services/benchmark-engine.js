/**
 * BenchmarkEngine — Computational Simulation & Stochastic Solvers
 * Implements client-side Monte Carlo racing simulations and mathematical algorithms.
 * Pure business logic without DOM dependencies.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BenchmarkEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Runs a Monte Carlo stochastic race strategy compute pass.
   * @param {number} runs Number of iterations (default 1000)
   * @param {number} laps Number of laps per race (default 57)
   * @returns {Object} Benchmark summary statistics
   */
  function runMonteCarloBenchmark(runs = 1000, laps = 57) {
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    let sum = 0;

    for (let i = 0; i < runs; i++) {
      let tyreDeg = 0;
      for (let lap = 0; lap < laps; lap++) {
        tyreDeg += Math.pow(lap / 30, 1.45) * 0.045 + (Math.random() * 0.02 - 0.01);
      }
      sum += tyreDeg;
    }

    const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const elapsedMs = Number((t1 - t0).toFixed(2));
    const meanWear = Number((sum / runs).toFixed(3));
    const totalLaps = runs * laps;

    return {
      runs,
      laps,
      totalLaps,
      elapsedMs,
      meanWear,
      status: 'STABLE'
    };
  }

  /**
   * Chinese Remainder Theorem solver helper for modular congruences.
   * @param {number[]} remainders
   * @param {number[]} moduli
   * @returns {number}
   */
  function solveCRT(remainders, moduli) {
    if (!remainders || !moduli || remainders.length !== moduli.length) return 0;
    const prod = moduli.reduce((acc, val) => acc * val, 1);
    let result = 0;

    function mulInv(a, b) {
      const b0 = b;
      let x0 = 0, x1 = 1;
      if (b === 1) return 1;
      while (a > 1) {
        const q = Math.floor(a / b);
        let t = b; b = a % b; a = t;
        t = x0; x0 = x1 - q * x0; x1 = t;
      }
      return x1 < 0 ? x1 + b0 : x1;
    }

    for (let i = 0; i < moduli.length; i++) {
      const m = moduli[i];
      const p = prod / m;
      result += remainders[i] * mulInv(p, m) * p;
    }
    return result % prod;
  }

  return {
    runMonteCarloBenchmark,
    solveCRT
  };
});
