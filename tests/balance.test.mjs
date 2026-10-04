import test from 'node:test'
import assert from 'node:assert/strict'
import { balanceReport } from '../scripts/balance-report.mjs'

// L11a: a student who plays seriously must win every scenario, while a
// negligent player must still be able to lose.
for (const row of balanceReport(200)) {
  test(`${row.theme}: serious play reaches "Bien joué", negligent play can still fail`, () => {
    assert.equal(row.good.winRate, 1)
    assert.ok(row.good.minCash >= 25)
    assert.equal(row.serious.winRate, 1)
    assert.ok(row.negligent.catastropheRate >= 0.15, `negligent catastrophe rate ${row.negligent.catastropheRate}`)
    assert.ok(row.negligent.winRate <= 0.3, `negligent win rate ${row.negligent.winRate}`)
  })
}
