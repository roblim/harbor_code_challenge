import React from 'react';
import Table, { TableBody, TableCell, TableRow, TableFooter } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import Button from 'material-ui/Button';

const getMoneyFormat = (amount) => {
  amount = parseFloat(amount);
  return (
    amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  )
};

const FIELDS = {
  year: obj => new Date(obj.start_date).getFullYear(),
  userAge: (obj, that) => new Date(obj.start_date).getFullYear() - that.userBirthday.getFullYear(),
  spouseAge: (obj, that) => new Date(obj.start_date).getFullYear() - that.spouseBirthday.getFullYear(),
  userWorkIncome: obj => getMoneyFormat(obj.sources.user_work),
  spouseWorkIncome: obj => getMoneyFormat(obj.sources.spouse_work),
  totalWorkIncome: obj => getMoneyFormat(obj.sources.user_work + obj.sources.spouse_work),
  userSocSecIncome: obj => getMoneyFormat(obj.sources.user_social_security),
  spouseSocSecIncome: obj => getMoneyFormat(obj.sources.spouse_social_security),
  totalSocSecIncome: obj => getMoneyFormat(obj.sources.user_social_security + obj.sources.spouse_social_security),
  retirementIncome: obj => getMoneyFormat(obj.sources.asset_income),
  combinedIncome: obj => getMoneyFormat(obj.total)
};

class Cashflow extends React.Component {
  constructor(props) {
    super(props);
    this.cashflow = this.props.cashflow.sort((a, b) => {
      return(
        (new Date(a.start_date)).getFullYear() - (new Date(b.start_date)).getFullYear()
      )
    });
    this.currentYear = new Date().getFullYear();
    this.userBirthday = new Date(this.props.userBirthday);
    this.spouseBirthday = this.props.spouseBirthday ? 
      new Date(this.props.spouseBirthday) : 
      null;
    this.joint = this.props.joint;
    this.state = {
      startIdx: this.cashflow.findIndex(el => new Date(el.start_date).getFullYear() === this.currentYear),
      spouseToggle: true
    }
  }

  generateDataRow = (field) => {
    const row = [];
    for (let i = this.state.startIdx; i < this.state.startIdx + 5; i++) {
      row.push(
        <TableCell>{FIELDS[field](this.cashflow[i], this)}</TableCell>
      )
    }
    return row;
  }

  generateAgeSection = (title = false) => {
    if (title === "title") {
      if (this.joint) {
        return(
          [
            <TableRow>
              <TableCell>Your Age</TableCell>
            </TableRow>,
            <TableRow>
              <TableCell>Spouse's Age</TableCell>
            </TableRow>
          ]
        )
      } else {
        return(
          <TableRow>
            <TableCell>Your Age</TableCell>
          </TableRow>
        )
      }
    } else {
      if (!this.joint) {
        return(
          <TableRow>
            {this.generateDataRow("userAge")}
          </TableRow>
        )
      } else {
        return(
          [
            <TableRow>
              {this.generateDataRow("userAge")}
            </TableRow>,
            <TableRow>
              {this.generateDataRow("spouseAge")}
            </TableRow>
          ]
        )
      }
    }
  }

  incomeTitle = (incomeSource) => {
    switch (true) {
      case (this.joint && this.state.spouseToggle):
        return (
          [
            <TableRow>
              <TableCell>My Income</TableCell>
            </TableRow>,
            <TableRow>
              <TableCell>Spouse's Income</TableCell>
            </TableRow>,
            <TableRow>
              <TableCell>{`Total ${incomeSource} Income`}</TableCell>
            </TableRow>
          ]
        );
      case (this.joint):
        return (
          <TableRow>
            <TableCell>{`Total ${incomeSource} Income`}</TableCell>
          </TableRow>
        );
      default:
        return (
          <TableRow>
            <TableCell>{`${incomeSource} Income`}</TableCell>
          </TableRow>
        )
    }
  }

  incomeData = (field) => {
    switch (true) {
      case (this.joint && this.state.spouseToggle):
        return (
          [
            <TableRow>{this.generateDataRow(`user${field}Income`)}</TableRow>,
            <TableRow>{this.generateDataRow(`spouse${field}Income`)}</TableRow>,
            <TableRow>{this.generateDataRow(`total${field}Income`)}</TableRow>
          ]
        );
      case (this.joint):
        return (<TableRow>{this.generateDataRow(`total${field}Income`)}</TableRow>);
      default:
        return (<TableRow>{this.generateDataRow(`user${field}Income`)}</TableRow>);
    }
  }

  handlePrevious = (event) => {
    event.preventDefault();
    const newIndex = this.state.startIdx - 5;
    newIndex > 0 ? this.setState({ startIdx: newIndex }) : this.setState({ startIdx: 0 })
  }

  handleNext = (event) => {
    event.preventDefault();
    const newIndex = this.state.startIdx + 5;
    newIndex < (this.cashflow.length - 5) ? this.setState({ startIdx: newIndex }) : this.setState({ startIdx: this.cashflow.length - 5 })
  }

  inflationAdjust = (year, amount) => {
    const yearsElapsed = year - 2017
    if (yearsElapsed >= 0) {
      return(
        amount * Math.pow(1.02, yearsElapsed)
      );
    } else {
      return(
        amount * Math.pow(0.98, Math.abs(yearsElapsed))
      );
    }
  }

  calculateFedTax = (year, income) => {
    switch (true) {
      case income > 0 && income < 9
    }
  }

  render() {
    return (
        <Paper>
          <div className="table">
            <Table className="title-column">
              <TableBody>
                <TableRow className="year">
                  <TableCell>Year</TableCell>
                </TableRow>
                {this.generateAgeSection("title")}
                {this.incomeTitle("Work")}
                {this.incomeTitle("Social Security")}
                <TableRow>
                  <TableCell>Retirement Savings Withdrawals</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Combined Income</TableCell>
                </TableRow>
              </TableBody>
            </Table>
        
            <div className="data-columns">
              <Table >
                <TableBody>
                  <TableRow className="year">
                    {this.generateDataRow("year")}
                  </TableRow>
                  {this.generateAgeSection()}
                  {this.incomeData("Work")}
                  {this.incomeData("SocSec")}
                  <TableRow>
                    {this.generateDataRow("retirementIncome")}
                  </TableRow>
                  <TableRow>
                    {this.generateDataRow("combinedIncome")}
                  </TableRow>
                </TableBody>
              </Table>
              <div className="navigation">
                <Button onClick={this.handlePrevious} disabled={this.state.startIdx === 0} >
                  <KeyboardArrowLeft />
                  Previous
                </Button>
                <Button onClick={this.handleNext} disabled={this.state.startIdx === this.cashflow.length - 5} >
                  Next
                  <KeyboardArrowRight />
                </Button>
              </div>
            </div>
          </div>
        </Paper>
    )
  }
}
 
export default Cashflow;
