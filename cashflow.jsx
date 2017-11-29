import React from 'react';
import Table, { TableBody, TableCell, TableRow, TableFooter } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import Button from 'material-ui/Button';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Switch from 'material-ui/Switch';

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
  combinedIncome: obj => getMoneyFormat(obj.total),
  taxes: (obj, that) => `(${getMoneyFormat(that.calculateFedTax(new Date(obj.start_date).getFullYear(), parseFloat(obj.total)))})`,
  afterTax: (obj, that) => getMoneyFormat(obj.total - (that.calculateFedTax(new Date(obj.start_date).getFullYear(), parseFloat(obj.total))))
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
            <TableRow className="age">
              <TableCell>Your Age</TableCell>
            </TableRow>,
            <TableRow className="age">
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
          <TableRow className="age">
            {this.generateDataRow("userAge")}
          </TableRow>
        )
      } else {
        return(
          [
            <TableRow className="age">
              {this.generateDataRow("userAge")}
            </TableRow>,
            <TableRow className="age">
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
            <TableRow className="income-total income-total-title">
              <TableCell>{`Total ${incomeSource} Income`}</TableCell>
            </TableRow>
          ]
        );
      case (this.joint):
        return (
          <TableRow className="income-total income-total-title">
            <TableCell>{`Total ${incomeSource} Income`}</TableCell>
          </TableRow>
        );
      default:
        return (
          <TableRow className="income-total income-total-title">
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
            <TableRow className="income-total">{this.generateDataRow(`total${field}Income`)}</TableRow>
          ]
        );
      case (this.joint):
        return (<TableRow className="income-total">{this.generateDataRow(`total${field}Income`)}</TableRow>);
      default:
        return (<TableRow className="income-total">{this.generateDataRow(`user${field}Income`)}</TableRow>);
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

  generateTaxBrackets = (year) => {
    switch (this.joint) {
      case true:
        return(
          {
            1: { floor: 0, ceil: this.inflationAdjust(year, 18650)},
            2: { floor: this.inflationAdjust(year, 18650), ceil: this.inflationAdjust(year, 75900), carry: this.inflationAdjust(year, 1865) },
            3: { floor: this.inflationAdjust(year, 75900), ceil: this.inflationAdjust(year, 153100), carry: this.inflationAdjust(year, 10452.5) },
            4: { floor: this.inflationAdjust(year, 153100), ceil: this.inflationAdjust(year, 233350), carry: this.inflationAdjust(year, 29752.5) },
            5: { floor: this.inflationAdjust(year, 233350), ceil: this.inflationAdjust(year, 416700), carry: this.inflationAdjust(year, 52222.5) },
            6: { floor: this.inflationAdjust(year, 416700), ceil: this.inflationAdjust(year, 470700), carry: this.inflationAdjust(year, 112.728) },
            7: { floor: this.inflationAdjust(year, 470700), carry: this.inflationAdjust(year, 121505.25) }
          }
        );
      default: 
        return (
          {
            1: { floor: 0, ceil: this.inflationAdjust(year, 9325) },
            2: { floor: this.inflationAdjust(year, 9325), ceil: this.inflationAdjust(year, 37950), carry: this.inflationAdjust(year, 932.5) },
            3: { floor: this.inflationAdjust(year, 37950), ceil: this.inflationAdjust(year, 91900), carry: this.inflationAdjust(year, 5226.25) },
            4: { floor: this.inflationAdjust(year, 91900), ceil: this.inflationAdjust(year, 191650), carry: this.inflationAdjust(year, 18713.75) },
            5: { floor: this.inflationAdjust(year, 191650), ceil: this.inflationAdjust(year, 416700), carry: this.inflationAdjust(year, 46643.75) },
            6: { floor: this.inflationAdjust(year, 416700), ceil: this.inflationAdjust(year, 418400), carry: this.inflationAdjust(year, 120910.25) },
            7: { floor: this.inflationAdjust(year, 418400), carry: this.inflationAdjust(year, 121505.25) }
          }
        );
    }
  }

  calculateFedTax = (year, income) => {
    const brackets = this.generateTaxBrackets(year);
    switch(true) {
      case income > brackets[1].floor && income < brackets[1].ceil:
        return(income * 0.1);
      case income > brackets[2].floor && income < brackets[2].ceil:
        return(brackets[2].carry + 0.15 * (income - brackets[2].floor));
      case income > brackets[3].floor && income < brackets[3].ceil:
        return(brackets[3].carry + 0.25 * (income - brackets[3].floor));
      case income > brackets[4].floor && income < brackets[4].ceil:
        return(brackets[4].carry + 0.28 * (income - brackets[4].floor));
      case income > brackets[5].floor && income < brackets[5].ceil:
        return(brackets[5].carry + 0.33 * (income - brackets[5].floor));
      case income > brackets[6].floor && income < brackets[6].ceil:
        return(brackets[6].carry + 0.35 * (income - brackets[6].floor));
      case income > brackets[7].floor:
        return(brackets[7].carry + 0.396 * (income - brackets[7].floor));
    }
  }

  spouseSwitch = () => {
    if (this.joint) {
      return(
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.spouseToggle}
                onChange={(event, checked) => this.setState({ spouseToggle: checked })}
              />
            }
            label="Show Spouse Data"
          />
        </FormGroup>
      );
    } else {
      return null;
    }
  }

  render() {
    return (
        <Paper>
          <div className="table">
          <div className="title-column">
              <Table>
                <TableBody>
                  <TableRow className="year year-title">
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
                  <TableRow>
                    <TableCell>Estimated Taxes</TableCell>
                  </TableRow>
                  <TableRow className="after-tax">
                    <TableCell>After-Tax Income</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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
                  <TableRow className="taxes">
                    {this.generateDataRow("taxes")}
                  </TableRow>
                  <TableRow className="after-tax">
                    {this.generateDataRow("afterTax")}
                  </TableRow>
                </TableBody>
              </Table>
              <div className="navigation">
                {this.spouseSwitch()}
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
