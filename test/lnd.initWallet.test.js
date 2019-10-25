import test from 'tape-promise/tape'
import LndGrpc from '../src'
import { spawnLnd, killLnd, grpcOptions, seed } from './helpers/lnd'

let lndProcess
let grpc

test('initWallet:setup', async t => {
  lndProcess = await spawnLnd({ cleanLndDir: true })
  t.end()
})

test('initWallet:test', async t => {
  try {
    t.plan(1)
    grpc = new LndGrpc(grpcOptions)
    await grpc.connect()
    await grpc.services.WalletUnlocker.initWallet({
      wallet_password: Buffer.from('password'),
      cipher_seed_mnemonic: seed,
    })
    grpc.activateLightning()
    grpc.once('active', async () => {
      t.equal(grpc.state, 'active', 'should emit "active" event and be in active state')
    })
  } catch (e) {
    await grpc.disconnect()
    await killLnd(lndProcess, { cleanLndDir: true })
    t.fail(e)
  }
})

test('initWallet:teardown', async t => {
  await grpc.disconnect()
  await killLnd(lndProcess, { cleanLndDir: true })
  t.end()
})
