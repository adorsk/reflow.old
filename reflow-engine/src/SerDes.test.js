import { assert } from 'chai'
import _ from 'lodash'

import SerDes from './SerDes.js'
import ProgramEngine from './ProgramEngine.js'

describe('SerDes', () => {

  beforeEach(() => {
    this.sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    this.sandbox.restore()
  })

  describe('serializeProgramEngine', () => {

    beforeEach(() => {
      this.serDes = new SerDes()
    })

    it('serializes packetCount', () => {
      const progEng = new ProgamEngine()
      progEng.packetCount = 10
      const serialized = this.serDes.serializeProgramEngine(progEng)
      assert.equal(serialized.packetCount, progEng.packetCount)
    })

    it('serializes tickCount', () => {
      const progEng = new ProgamEngine()
      progEng.tickCount = 10
      const serialized = this.serDes.serializeProgramEngine(progEng)
      assert.equal(serialized.tickCount, progEng.tickCount)
    })

    it('serializes wires', () => {
      const progEng = new ProgamEngine()
      this.sandbox.stub(progEng, 'getWires')
      const serialized = this.serDes.serializeProgramEngine(progEng)
      assert.equal(serialized.wires, programEngine.getWires.returnValues[0])
    })

    it('serializes prevInputs', () => {
      const progEng = new ProgamEngine()
      progEngine.prevInputs = 'some fake prevInputs'
      this.sandbox.stub(this.serDes, 'serializePackets')
      const serialized = this.serDes.serializeProgramEngine(progEng)
      assert.equal(
        serialized.prevInputs,
        this.serDes.serializePackets.returnValues[0]
      )
    })

    it('serializes procs', () => {
      const progEng = new ProgamEngine()
      this.sandbox.stub(this.serDes, 'serializeProcs')
      this.sandbox.stub(progEng, 'getProcs')
      const serialized = this.serDes.serializeProgramEngine(progEng)
      assert.equal(serialized.procs, this.serDes.serializeProcs.returnValues[0])
      assert.true(
        this.serDes.serializeProcs.calledWith(progEng.getProcs.returnValues[0])
      )
    })
  })

  describe('serializePackets', () => {
    it('serializes packets', () => {
      assert.fail()
    })
  })

  describe('serializeProc', () => {
    it('serializes id', () => {
      assert.fail()
    })

    it('serializes componentId', () => {
      assert.fail()
    })

    it('serializes state', () => {
      assert.fail()
    })

    it('serializes outputs', () => {
      assert.fail()
    })
  })

  describe('serializeProcState', () => {
    it('uses component.serializeState if provided', () => {
      assert.fail()
    })

    it('returns state as-is if !component.serializeState', () => {
      assert.fail()
    })
  })
})
