(function(){
	const table = $('#logic-expression-result-table')
	const errorMsg = $('#logic-expression-error-message')
	errorMsg.hide()
	table.hide()
	function evalLogic(logicStr){
		logicStr = logicStr
		  .replace(/∧|\&+|\*|\/\\/g, '&&')
		  .replace(/∨|\|+|\+|\\\//g, '||')
		  .replace(/¬|~/g, '!')
		  .replace(/↔|==|<=>|<->/g, '===')
		  .replace(/→|=>|->/g, '<=')
		console.log(logicStr)
		const matches = new Set(logicStr.match(/\w+/g))
		const parameters = Array.from(matches)
		const evaluator = new Function(...parameters, 'return ' + logicStr)
	
		const possibilities = []
		function iteratePossibilities(state, index) {
			if (index === parameters.length) {
				possibilities.push({
					result: evaluator.apply(null, parameters.map(param => state[param])),
					params: Object.assign({}, state)
				})
			} else {
				const param = parameters[index]
				state[param] = true
				iteratePossibilities(state, index+1)
				state[param] = false
				iteratePossibilities(state, index+1)
			}
		}
		iteratePossibilities({}, 0)
		return {
			parameters: parameters,
			possibilities: possibilities
		}
	}
	$('#logic-expression-button-submit').click(event => {
		const expression = $('#logic-expression-input').val()
		try {
			const result = evalLogic(expression)
			errorMsg.hide()
			table.show()
			const header = table.children('thead').children('tr')
			header.empty()
			result.parameters.forEach(param => {
				header.append(`<th scope="col">${param}</th>`)
			})
			header.append('<th scope="col">Result</th>')
			const body = table.children('tbody')
			body.empty()
			result.possibilities.forEach(possibility => {
				body.append(`<tr>${
					result.parameters
					.map(param => `<th scope="row">${possibility.params[param] ? 'T' : 'F'}</th>`)
					.concat(`<td>${possibility.result ? 'T' : 'F'}</td>`)
				}</tr>`)
			})
			$('#logic-expression-input').val(expression
							 .replace(/\&+|\*|\/\\/g, '∧')
							 .replace(/\|+|\+|\\\//g, '∨')
							 .replace(/~/g, '¬')
							 .replace(/==|<=>|<->/g, '↔')
							 .replace(/=>|->/g, '→'))
		} catch (error) {
			table.hide()
			errorMsg.text(error.message)
			errorMsg.show()
		}
	})
})()
