import deckMetadata from "./cards/metadata"
import superagent from "superagent"

import PropTypes from "prop-types"
import React from "react"

import Grid from "material-ui/Grid"
import Typography from "material-ui/Typography"
import TextField from "material-ui/TextField"
import {FormGroup, FormControlLabel} from "material-ui/Form"
import Tooltip from "material-ui/Tooltip"
import Checkbox from "material-ui/Checkbox"
import MiniCard from "./MiniCard"
import Button from "material-ui/Button"

class Settings extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			scoreLimit: "8",
			blankCards: "30",
			decks: [],
			blackCards: 0,
			whiteCards: 0,
		}
	}

	isInputValid() {
		const scoreLimit = parseInt(this.state.scoreLimit)
		const blankCards = parseInt(this.state.blankCards)
		return (
			!isNaN(scoreLimit) &&
			!isNaN(blankCards) &&
			scoreLimit > 1 &&
			scoreLimit <= 255 &&
			blankCards >= 0 &&
			blankCards <= 255 &&
			this.state.decks.length !== 0
		)
	}

	async submit() {
		const res = await superagent.
			post("/create-game").
			send({
				scoreLimit: parseInt(this.state.scoreLimit),
				blankCards: parseInt(this.state.blankCards),
				decks: this.state.decks,
				owner: this.props.username,
			})
		location.href = `/${res.text}`
	}

	render() {
		const decks = deckMetadata.map((deck) => (
			<Tooltip key={deck[0]} title={`${deck[2]} Black Cards, ${deck[3]} White Cards`}>
				<FormControlLabel
					label={deck[1]}
					control={
						<Checkbox
							onChange={(e) => {
								if (e.target.checked) {
									this.setState((state) => ({
										blackCards: state.blackCards + deck[2],
										whiteCards: state.whiteCards + deck[3],
									}))
									this.state.decks.push(deck[0])
								} else {
									this.setState((state) => ({
										blackCards: state.blackCards - deck[2],
										whiteCards: state.whiteCards - deck[3],
									}))
									this.state.decks.splice(this.state.decks.indexOf(deck[0]), 1)
								}
							}}
						/>
					}
				/>
			</Tooltip>
		))

		return (
			<Grid
				container
				style={{
					margin: "auto",
					maxWidth: 750,
					width: "100%",
				}}
			>
				<Grid item xs={12}>
					<Typography type="headline">General</Typography>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
				>
					<TextField
						label="Score Limit"
						value={this.state.scoreLimit}
						onChange={(e) => this.setState({scoreLimit: e.target.value})}
						fullWidth
					/>
				</Grid>
				<Grid
					item
					xs={12}
					sm={6}
				>
					<TextField
						label="Blank Cards"
						value={this.state.blankCards}
						onChange={(e) => this.setState({blankCards: e.target.value})}
						fullWidth
					/>
				</Grid>

				<Grid item xs={12}>
					<Typography type="headline">Decks</Typography>
				</Grid>
				<Grid item xs={12}>
					<FormGroup row>
						{decks}
					</FormGroup>
				</Grid>
				<Grid item xs={12}>
					<MiniCard color="black">{this.state.blackCards}</MiniCard>
					<MiniCard color="white">{this.state.whiteCards}</MiniCard>
				</Grid>

				<Grid item xs={12}>
					<Button
						raised
						disabled={!this.isInputValid()}
						onClick={this.submit.bind(this)}
					>
						Create Game
					</Button>
				</Grid>
			</Grid>
		)
	}
}

Settings.propTypes = {
	username: PropTypes.string.isRequired,
}

export default Settings
