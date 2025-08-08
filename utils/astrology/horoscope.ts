// import { AstroChartInformation, useAstrologicalChart } from './astrology';
// import dayjs from 'dayjs';

// type Aspects = { type: string; natalPlanet: AstroChartInformation; transitPlanet: AstroChartInformation; }[];

// // const calculateAspects = (natalChart: AstroChartInformation[], transitChart: AstroChartInformation[]) => {
// const calculateAspects = (natalChart: AstroChartInformation[], transitChart: AstroChartInformation[]) => {
//     const aspects: Aspects = [];
//     const acceptableOrb = 8;  // Orb in degrees for allowable difference

//     // Compare each planet in the natal chart with each planet in the transit chart
//     natalChart.forEach(natalPlanet => {
//         const natalDecimal = natalPlanet.eclipticLongitude;  // Direct use of longitude property
//         transitChart.forEach(transitPlanet => {
//             const transitDecimal = transitPlanet.eclipticLongitude;  // Direct use of longitude property
//             const difference = Math.abs(natalDecimal - transitDecimal);
//             const angle = difference > 180 ? 360 - difference : difference;

//             // Determine the type of aspect based on the angle
//             if (angle <= acceptableOrb || angle >= 360 - acceptableOrb) {
//                 aspects.push({ type: 'Conjunction', natalPlanet, transitPlanet });
//             } else if (Math.abs(angle - 180) <= acceptableOrb) {
//                 aspects.push({ type: 'Opposition', natalPlanet, transitPlanet });
//             } else if (Math.abs(angle - 90) <= acceptableOrb) {
//                 aspects.push({ type: 'Square', natalPlanet, transitPlanet });
//             } else if (Math.abs(angle - 120) <= acceptableOrb) {
//                 aspects.push({ type: 'Trine', natalPlanet, transitPlanet });
//             } else if (Math.abs(angle - 60) <= acceptableOrb) {
//                 aspects.push({ type: 'Sextile', natalPlanet, transitPlanet });
//             }
//         });
//     });

//     return aspects;
// };


// const interpretAspects = (aspects: Aspects) => {
//   return aspects.map(aspect => {
//       const { type, natalPlanet, transitPlanet } = aspect;
//       let interpretation = `${transitPlanet.body} in ${transitPlanet.sign} ${type} ${natalPlanet.body} in ${natalPlanet.sign}`;

//       switch (type) {
//           case 'Conjunction':
//               interpretation += ' - energies are combined and intensified.';
//               break;
//           case 'Opposition':
//               interpretation += ' - indicates tension and the need for balance.';
//               break;
//           case 'Square':
//               interpretation += ' - suggests challenge and conflict.';
//               break;
//           case 'Trine':
//               interpretation += ' - signifies a harmonious flow of energy, facilitating natural talents and ease.';
//               break;
//           case 'Sextile':
//               interpretation += ' - provides opportunities and potential for productive collaboration.';
//               break;
//       }

//       return interpretation;
//   });
// };

// export const generateHoroscope = (currentDate: string) => {
//   const transitChart = useAstrologicalChart(dayjs(currentDate).toDate());
//   const natalChart = useAstrologicalChart(dayjs("20/01/1994").toDate());
//   const aspects = calculateAspects(natalChart, transitChart);
//   const interpretations = interpretAspects(aspects);
//   return interpretations.join(' \n');
// };

