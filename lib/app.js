const React = require('react')

const VCR = React.createClass({
  render() {
    return (
      <div>
        <RaisedButton primary={true} label="Local File">
          <FontIcon style={{}} className="muidocs-icon-custom-github" />
        </RaisedButton>
        <RaisedButton secondary={true} label="Youtube">
          <FontIcon style={{}} className="muidocs-icon-custom-github" />
        </RaisedButton>
      </div>
    )
  },
})


React.render(<VCR />, document.getElementById('app'))
