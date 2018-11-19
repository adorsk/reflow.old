import _ from 'lodash'

import Serializer from './Serializer.js'
import ProgramEngine from 'reflow-engine/src/ProgramEngine.js'

describe('Serializer', () => {
 
  describe('serialize', () => {
    let fixtures, deserialized

    beforeEach(() => {
      fixtures = {}
      fixtures.widgets = {
        serializing: {
          serializeState: (state) => ({serialized: state})
        },
        nonSerializing: {},
      }
      fixtures.programState = {
        programEngine: new ProgramEngine(),
        frameStates: null,
        widgetStates: _.mapValues(fixtures.widgets, (widget, procId) => {
          return `stateFor:${procId}`
        })
      }
      deserialized = (new Serializer()).serialize({
        programState: fixtures.programState,
        widgets: fixtures.widgets
      })
    })

    it('serializes programEngine', () => {
      const expected = fixtures.programState.programEngine.serialize()
      expect(deserialized.programEngine).toEqual(expected)
    })

    it('copies frameStates', () => {
      const expected = fixtures.programState.frameStates
      expect(deserialized.frameStates).toEqual(expected)
    })

    it('serializes widget states', () => {
      const expected = _.mapValues(
        fixtures.programState.widgetStates,
        (widgetState, procId) => {
          const widget = fixtures.widgets[procId]
          return (
            (widget.serializeState)
              ? widget.serializeState(widgetState)
              : widgetState
          )
      })
      expect(deserialized.widgetStates).toEqual(expected)
    })
  })

  describe('deserialize', () => {
    let fixtures, deserialized

    beforeEach(async () => {
      fixtures = {}
      fixtures.serialization = {
        programEngine: {},
        frameStates: {},
        widgetStates: {}
      }
      fixtures.serializer = new Serializer()
      fixtures.mockDeserializeProgEng = jest.fn()
      fixtures.mockDeserializeProgEng.mockReturnValue('fakeProgEng')
      fixtures.serializer.deserializeProgramEngine = (
        fixtures.mockDeserializeProgEng)
      deserialized = await fixtures.serializer.deserialize(
        fixtures.serialization)
    })

    it('deserializes programEngine', () => {
      const expected = fixtures.mockDeserializeProgEng.mock.results[0].value
      expect(deserialized.programEngine).toEqual(expected)
    })

    it('copies frameStates', () => {
      const expected = fixtures.serialization.frameStates
      expect(deserialized.frameStates).toEqual(expected)
    })

    it('copies widgetStates', () => {
      const expected = fixtures.serialization.widgetStates
      expect(deserialized.widgetStates).toEqual(expected)
    })
  })
})
