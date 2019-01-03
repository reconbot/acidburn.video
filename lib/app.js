const React = require('react')
const RaisedButton = require('material-ui/lib/raised-button')
const FontIcon = require('material-ui/lib/font-icon')

const VCR = React.createClass({
  render() {
    return (
      <div>
        <RaisedButton primary={true} label="Local File">
          <FontIcon style={{}} className="muidocs-icon-custom-github"/>
        </RaisedButton>
        <RaisedButton secondary={true} label="Youtube">
          <FontIcon style={{}} className="muidocs-icon-custom-github"/>
        </RaisedButton>
      </div>
    )
  },
})


React.render(<VCR />, document.getElementById('app'))
