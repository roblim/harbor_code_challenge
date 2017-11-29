import React from 'react';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

const FIELDS = {
  year: obj => new Date(obj.start_date).getFullYear(),
  userAge: (obj, that) => new Date(obj.start_date).getFullYear() - that.userBirthday.getFullYear(),
  spouseAge: (obj, that) => new Date(obj.start_date).getFullYear() - that.spouseBirthday.getFullYear(),
  userWorkIncome: obj => obj.sources.user_work,
  spouseWorkIncome: obj => obj.sources.spouse_work,
  totalWorkIncome: obj => obj.sources.user_work + obj.sources.spouse_work,
  userSocSecIncome: obj => obj.sources.user_social_security,
  spouseSocSecIncome: obj => obj.sources.spouse_social_security,
  totalSocSecIncome: obj => obj.sources.user_social_security + obj.sources.spouse_social_security,
  retirementIncome: obj => obj.sources.asset_income,
  combinedIncome: obj => obj.total
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
      startIdx: this.cashflow.findIndex((el) => new Date(el.start_date).getFullYear() === this.currentYear),
      spouseToggle: true
    }
  }

  generateRow = (field) => {
    const row = [];
    for (let i = this.state.startIdx; i < this.state.startIdx + 5; i++) {
      row.push(
        <TableCell>{FIELDS[field](this.cashflow[i], this)}</TableCell>
      )
    }
    return row;
  }

  age = (title = false) => {
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
            {this.generateRow("userAge")}
          </TableRow>
        )
      } else {
        return(
          [
            <TableRow>
              {this.generateRow("userAge")}
            </TableRow>,
            <TableRow>
              {this.generateRow("spouseAge")}
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
            <TableRow>{this.generateRow(`user${field}Income`)}</TableRow>,
            <TableRow>{this.generateRow(`spouse${field}Income`)}</TableRow>,
            <TableRow>{this.generateRow(`total${field}Income`)}</TableRow>
          ]
        );
      case (this.joint):
        return (<TableRow>{this.generateRow(`total${field}Income`)}</TableRow>);
      default:
        return (<TableRow>{this.generateRow(`user${field}Income`)}</TableRow>);
    }
  }

  render() {
    return (
      <div>
        <Paper className="table">
          <Table classes="title-column">
            <TableBody>
              <TableRow>
                <TableCell>Year</TableCell>
              </TableRow>
              {this.age("title")}
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
        
        
          <Table className="data-columns">
            <TableBody>
              <TableRow>
                {this.generateRow("year")}
              </TableRow>
              {this.age()}
              {this.incomeData("Work")}
              {this.incomeData("SocSec")}
              <TableRow>
                {this.generateRow("retirementIncome")}
              </TableRow>
              <TableRow>
                {this.generateRow("combinedIncome")}
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </div>
    )
  }
}
 
export default Cashflow;
