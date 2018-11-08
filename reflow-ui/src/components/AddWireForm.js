import React from 'react'
import _ from 'lodash'
import Select from 'react-select'


class AddWireForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedSrcOption: null,
      selectedDestOption: null,
    }
  }

  render () {
    const { selectedSrcOption, selectedDestOption } = this.state
    const options = this._getOptionsForIoHandleInfos()
    return (
      <div>
        <span>
          <label>src</label>
          <Select
            options={options['outputs']}
            value={selectedSrcOption}
            onChange={(value) => this.setState({selectedSrcOption: value})}
          />
        </span>
        <span>
          <label>dest</label>
          <Select
            options={options['inputs']}
            value={selectedDestOption}
            onChange={(value) => this.setState({selectedDestOption: value})}
          />
        </span>
        <span>
          <button onClick={() => this._addWire()}>+</button>
        </span>
      </div>
    )
  }

  _getOptionsForIoHandleInfos () {
    const { ioHandleInfos } = this.props
    const infosByIoType = _.groupBy(ioHandleInfos, 'ioType')
    const options = {}
    _.each(infosByIoType, (infosForIoType, ioType) => {
      options[ioType] = _.map(infosForIoType, (info) => {
        return {value: info.id, label: info.id}
      })
    })
    return options
  }

  _addWire () {
    const {selectedSrcOption, selectedDestOption} = this.state
    const { ioHandleInfos } = this.props
    const srcInfo = ioHandleInfos[selectedSrcOption.value]
    const destInfo = ioHandleInfos[selectedDestOption.value]
    if (! srcInfo || ! destInfo) { return }
    this.props.addWire({
      src: {
        modId: srcInfo.modId,
        ioType: srcInfo.ioType,
        ioId: srcInfo.handle.id
      },
      dest: {
        modId: destInfo.modId,
        ioType: destInfo.ioType,
        ioId: destInfo.handle.id
      },
    })
  }
}

export default AddWireForm
