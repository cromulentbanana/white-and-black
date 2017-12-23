import "./main.sass"

import React, {Fragment} from "react"
import ReactDOM from "react-dom"

import Header from "./Header"
import Settings from "./Settings"

class Index extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			username: localStorage.username || "",
		}
	}

	resetUsername() {
		delete localStorage.username
		this.setState({
			username: "",
		})
	}

	render() {
		return (
			<Fragment>
				<Header username={this.state.username} onUsernameChange={this.resetUsername.bind(this)} />
				<Settings />
			</Fragment>
		)
	}
}

addEventListener("DOMContentLoaded", () => {
	ReactDOM.render(<Index />, document.getElementById("root"))
})
