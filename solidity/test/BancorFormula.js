/* global artifacts, contract, it, before, assert, web3 */
/* eslint-disable prefer-reflect, no-loop-func */

let constants = require('./helpers/FormulaConstants');
let catchRevert = require('./helpers/Utils').catchRevert;
let TestBancorFormula = artifacts.require('./helpers/TestBancorFormula');

contract('BancorFormula', () => {
    let formula;
    before(async () => {
        formula = await TestBancorFormula.new();
    });

    let twoFiftySix = web3.utils.toBN(256);
    let maxExp = twoFiftySix.sub(web3.utils.toBN(constants.MAX_PRECISION));
	console.log(twoFiftySix, maxExp);
    //let ILLEGAL_VAL = web3.utils.toBN(2).pow(256);
    //let MAX_BASE_N = web3.utils.toBN(2).toPower(256 - constants.MAX_PRECISION).minus(1);
    let ILLEGAL_VAL = web3.utils.toBN(2).pow(twoFiftySix);
    let MAX_BASE_N = web3.utils.toBN(2).pow(maxExp).sub(web3.utils.toBN(1));
    let MIN_BASE_D = web3.utils.toBN(1);
    let MAX_EXPONENT = 1000000;

    for (let percent = 1; percent <= 100; percent++) {
        let baseN = MAX_BASE_N;
        let baseD = MAX_BASE_N.sub(web3.utils.toBN(1));
        let expN  = MAX_EXPONENT * percent / 100;
        let expD  = MAX_EXPONENT;
        let test  = `Function power(0x${baseN.toString(16)}, 0x${baseD.toString(16)}, ${expN}, ${expD})`;

        it(`${test}`, async () => {
            await formula.powerTest(baseN, baseD, expN, expD);
        });
    }

    for (let percent = 1; percent <= 100; percent++) {
        let baseN = MAX_BASE_N;
        let baseD = MAX_BASE_N.sub(web3.utils.toBN(1));
        let expN  = MAX_EXPONENT;
        let expD  = MAX_EXPONENT * percent / 100;
        let test  = `Function power(0x${baseN.toString(16)}, 0x${baseD.toString(16)}, ${expN}, ${expD})`;

        it(`${test}`, async () => {
            await formula.powerTest(baseN, baseD, expN, expD);
        });
    }

    for (let percent = 1; percent <= 100; percent++) {
        let baseN = MAX_BASE_N;
        let baseD = MIN_BASE_D;
        let expN  = MAX_EXPONENT * percent / 100;
        let expD  = MAX_EXPONENT;
        let test  = `Function power(0x${baseN.toString(16)}, 0x${baseD.toString(16)}, ${expN}, ${expD})`;

        it(`${test}`, async () => {
            if (percent < 64)
                await formula.powerTest(baseN, baseD, expN, expD);
            else
                await catchRevert(formula.powerTest(baseN, baseD, expN, expD));
        });
    }

    for (let percent = 1; percent <= 100; percent++) {
        let baseN = MAX_BASE_N;
        let baseD = MIN_BASE_D;
        let expN  = MAX_EXPONENT;
        let expD  = MAX_EXPONENT * percent / 100;
        let test  = `Function power(0x${baseN.toString(16)}, 0x${baseD.toString(16)}, ${expN}, ${expD})`;

        it(`${test}`, async () => {
            await catchRevert(formula.powerTest(baseN, baseD, expN, expD));
        });
    }

    let values = [
        //MAX_BASE_N.dividedToIntegerBy(MIN_BASE_D),
        //MAX_BASE_N.dividedToIntegerBy(MAX_BASE_N.minus(1)),
        //MIN_BASE_D.plus(1).dividedToIntegerBy(MIN_BASE_D),
        MAX_BASE_N.div(MIN_BASE_D),
        MAX_BASE_N.div(MAX_BASE_N.sub(web3.utils.toBN(1))),
        MIN_BASE_D.add(web3.utils.toBN(1)).div(MIN_BASE_D),
    ];

    for (let index = 0; index < values.length; index++) {
        let test = `Function generalLog(0x${values[index].toString(16)})`;

        it(`${test}`, async () => {
            let retVal = await formula.generalLogTest(values[index]);
            assert(retVal.times(MAX_EXPONENT).lessThan(ILLEGAL_VAL), `output is too large`);
        });
    }

    for (let precision = constants.MIN_PRECISION; precision <= constants.MAX_PRECISION; precision++) {
        let maxExp = web3.utils.toBN(constants.maxExpArray[precision]);
        let shlVal = web3.utils.toBN(2).pow(web3.utils.toBN(constants.MAX_PRECISION - precision));
        let tuples = [
            {'input' : maxExp.add(web3.utils.toBN(0)).mul(shlVal).sub(web3.utils.toBN(1)), 'output' : web3.utils.toBN(precision-0)},
            {'input' : maxExp.add(web3.utils.toBN(0)).mul(shlVal).sub(web3.utils.toBN(0)), 'output' : web3.utils.toBN(precision-0)},
            {'input' : maxExp.add(web3.utils.toBN(1)).mul(shlVal).sub(web3.utils.toBN(1)), 'output' : web3.utils.toBN(precision-0)},
            {'input' : maxExp.add(web3.utils.toBN(1)).mul(shlVal).sub(web3.utils.toBN(0)), 'output' : web3.utils.toBN(precision-1)},
        ];

        for (let index = 0; index < tuples.length; index++) {
            let input  = tuples[index]['input' ];
            let output = tuples[index]['output'];
            let test   = `Function findPositionInMaxExpArray(0x${input.toString(16)})`;

            it(`${test}`, async () => {
                if (precision == constants.MIN_PRECISION && output.lessThan(web3.utils.toBN(precision))) {
                    await catchRevert(formula.findPositionInMaxExpArrayTest(input));
                }
                else {
                    let retVal = await formula.findPositionInMaxExpArrayTest(input);
                    assert(retVal.equals(output), `output should be ${output.toString(10)} but it is ${retVal.toString(10)}`);
                }
            });
        }
    }

    for (let precision = constants.MIN_PRECISION; precision <= constants.MAX_PRECISION; precision++) {
        let maxExp = web3.utils.toBN(constants.maxExpArray[precision]);
        let maxVal = web3.utils.toBN(constants.maxValArray[precision]);
        let errExp = maxExp.add(web3.utils.toBN(1));
        let test1  = `Function generalExp(0x${maxExp.toString(16)}, ${precision})`;
        let test2  = `Function generalExp(0x${errExp.toString(16)}, ${precision})`;

        it(`${test1}`, async () => {
            let retVal = await formula.generalExpTest(maxExp, precision);
            assert(retVal.equals(maxVal), `output is wrong`);
        });

        it(`${test2}`, async () => {
            let retVal = await formula.generalExpTest(errExp, precision);
            assert(retVal.lessThan(maxVal), `output indicates that maxExpArray[${precision}] is wrong`);
        });
    }

    for (let precision = constants.MIN_PRECISION; precision <= constants.MAX_PRECISION; precision++) {
        let minExp = web3.utils.toBN(constants.maxExpArray[precision-web3.utils.toBN(1)]).add(web3.utils.toBN(1));
        let minVal = web3.utils.toBN(2).pow(web3.utils.toBN(precision));
        let test   = `Function generalExp(0x${minExp.toString(16)}, ${precision})`;

        it(`${test}`, async () => {
            let retVal = await formula.generalExpTest(minExp, precision);
            assert(retVal.greaterThanOrEqualTo(minVal), `output is too small`);
        });
    }

    for (let n = 1; n <= 255; n++) {
        let tuples = [
            {'input' : web3.utils.toBN(2).pow(web3.utils.toBN(n))           , 'output' : web3.utils.toBN(n)},
            {'input' : web3.utils.toBN(2).pow(web3.utils.toBN(n)).add(web3.utils.toBN(1))   , 'output' : web3.utils.toBN(n)},
            {'input' : web3.utils.toBN(2).pow(web3.utils.toBN(n+1)).sub(web3.utils.toBN(1)), 'output' : web3.utils.toBN(n)},
        ];

        for (let index = 0; index < tuples.length; index++) {
            let input  = tuples[index]['input' ];
            let output = tuples[index]['output'];
            let test   = `Function floorLog2(0x${input.toString(16)})`;

            it(`${test}`, async () => {
                let retVal = await formula.floorLog2Test(input);
                assert(retVal.equals(output), `output should be ${output.toString(10)} but it is ${retVal.toString(10)}`);
            });
        }
    }

// TODO use old bignumber package or work around decimals
//    let Decimal = require("decimal.js");
//    Decimal.set({precision: 100, rounding: Decimal.ROUND_DOWN});
//    web3.BigNumber.config({DECIMAL_PLACES: 100, ROUNDING_MODE: web3.BigNumber.ROUND_DOWN});
//
//    let LOG_MIN = 1;
//    let EXP_MIN = 0;
//    let LOG_MAX = web3.utils.toBN(Decimal.exp(1).toFixed());
//    let EXP_MAX = web3.utils.toBN(Decimal.pow(2,4).toFixed());
//    let FIXED_1 = web3.utils.toBN(2).toPower(constants.MAX_PRECISION);
//
//    for (let percent = 0; percent < 100; percent++) {
//        let x = web3.utils.toBN(percent).div(100).mul(LOG_MAX.sub(web3.utils.toBN(LOG_MIN))).add(web3.utils.toBN(LOG_MIN));
//
//        it(`Function optimalLog(${x.toFixed()})`, async () => {
//            let fixedPoint = await formula.optimalLogTest(FIXED_1.times(x).truncated());
//            let floatPoint = web3.utils.toBN(Decimal(x.toFixed()).ln().times(FIXED_1.toFixed()).toFixed());
//            let ratio = fixedPoint.equals(floatPoint) ? web3.utils.toBN(1) : fixedPoint.dividedBy(floatPoint);
//            assert(ratio.greaterThanOrEqualTo("0.99999999999999999999999999999999999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
//        });
//    }
//
//    for (let percent = 0; percent < 100; percent++) {
//        let x = web3.utils.toBN(percent).dividedBy(100).times(EXP_MAX.minus(EXP_MIN)).plus(EXP_MIN);
//
//        it(`Function optimalExp(${x.toFixed()})`, async () => {
//            let fixedPoint = await formula.optimalExpTest(FIXED_1.times(x).truncated());
//            let floatPoint = web3.utils.toBN(Decimal(x.toFixed()).exp().times(FIXED_1.toFixed()).toFixed());
//            let ratio = fixedPoint.equals(floatPoint) ? web3.utils.toBN(1) : fixedPoint.dividedBy(floatPoint);
//            assert(ratio.greaterThanOrEqualTo("0.99999999999999999999999999999999999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
//        });
//    }
//
//    for (let n = 0; n < 256 - constants.MAX_PRECISION; n++) {
//        let values = [
//            web3.utils.toBN(2).toPower(n),
//            web3.utils.toBN(2).toPower(n).plus(1),
//            web3.utils.toBN(2).toPower(n).times(1.5),
//            web3.utils.toBN(2).toPower(n+1).minus(1),
//        ];
//
//        for (let index = 0; index < values.length; index++) {
//            let x = values[index];
//
//            it(`Function generalLog(${x.toFixed()})`, async () => {
//                let fixedPoint = await formula.generalLogTest(FIXED_1.times(x).truncated());
//                let floatPoint = web3.utils.toBN(Decimal(x.toFixed()).ln().times(FIXED_1.toFixed()).toFixed());
//                let ratio = fixedPoint.equals(floatPoint) ? web3.utils.toBN(1) : fixedPoint.dividedBy(floatPoint);
//                assert(ratio.greaterThanOrEqualTo("0.99999999999999999999999999999999999") && ratio.lessThanOrEqualTo("1"), `ratio = ${ratio.toFixed()}`);
//            });
//        }
//    }
});
