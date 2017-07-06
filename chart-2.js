(function() {
    var margin = {
            top: 30,
            left: 100,
            right: 30,
            bottom: 30
        },
        height = 1500 - margin.top - margin.bottom,
        width = 1100 - margin.left - margin.right;

    // console.log("Building chart 1");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong style='color: black'>" + d.Company + "</strong>" +
                "<br>" +
                "<br><span style='color:gray' 'font-weight:bolder'> Year: </span>" +
                "<span style='color:black' 'font-weight:bolder'> " + d.Year + "</span>" +
                "<br><span style='color:gray' 'font-weight:bolder'> Product:</span>" +
                "<span style='color:black' 'font-weight:bolder'> " + d.Product + "</span>" +
                "<br><span style='color:gray' 'font-weight:bolder'> Count:</span>" +
                "<span style='color:black' 'font-weight:bolder'> " + d.Count + "</span>"
        })


    var svg = d3.select("#chart-2")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);


    d3.queue()
        .defer(d3.csv, "final.csv")
        .await(ready);




    function ready(error, datapoints) {

        var company = datapoints.map(function(d) {
            return d.Company
        });
        company = d3.set(company).values()

        var year = datapoints.map(function(d) {
            return d.Year
        });
        year = d3.set(year).values()

        var product = datapoints.map(function(d) {
            return d.Product
        });
        product = d3.set(product).values()

        var companyScale = d3.scalePoint().domain(company).range([10, height]).padding(0.5);

        var yearScale = d3.scaleLinear().domain(['2012', '2017']).range([100, width-100])

        var colorScale = d3.scaleOrdinal()
        .domain(["Mortgage", "Debt collection", "Credit reporting", "Credit card", "Bank account or service", "Consumer loan", "Student loan", "Prepaid card", "Money transfers", "Payday Loan", "Other financial service", "Virtual currency", "Credit reporting credit repair services or other personal consumer reports", "Credit card or prepaid card", "Checking or savings account", "Money transfer virtual currency or money service"])
        .range(["#1ABC9C", "#16A085", "#F1C40F", "#F39C12", "#E67E22", "#D35400", "#3498DB", "#2980B9", "#E74C3C", "#C0392B", "#95A5A6", "#7F8C8D", "#2ECC71", "#27AE60", "#34495E", "#2C3E50", "#9B59B6", "#8E44AD"])

        var maxCount = d3.max(datapoints, function(d) {
            return +d.Count;
        })

        var radiusScale = d3.scaleSqrt().domain([0, maxCount]).range([1, 120])

        var xAxis = d3.axisTop(yearScale);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("stroke-width", "1")
            .call(xAxis.ticks(6).tickFormat(d3.format("d")));


        var yAxis = d3.axisLeft(companyScale);
        svg.append("g")
            .attr("class", "y-axis")
            //.attr("transform", "translate (" + width + ",0)")
            .call(yAxis);


        svg.selectAll("circle")
            .data(datapoints)
            .enter()
            .append("circle")
            .attr("class", function(d) {
                var group = d.Group
                //var companyName = d.Company.replace(" ", "-")
                var productType = d.Product.replace(" ", "-")
                return "circle " + productType + " " + group;
            })
            .attr("cx", function(d) {
                return yearScale(d.Year)
            })
            .attr("cy", function(d) {
                return companyScale(d.Company)
            })
            .attr("r", function(d) {
                return radiusScale(d.Count)
            })
            .attr("stroke", "white")
            .attr("stroke-width", "0")
            .attr("opacity", "0.2")
            .attr("fill", function(d) {
                return colorScale(d.Product)
            })

        .on('mouseover', function(d, i) {
            tip.show(d)
            var element = d3.select(this);
            element.style("stroke-width", "3")
            element.style("stroke", "black");
            element.style("opacity", "0.7")
        })

        .on('mouseout', function(d, i) {
            tip.hide(d)
            var element = d3.select(this);
            element.style("stroke-width", "0")
            element.style("stroke", "white")
            element.style("opacity", "0.2")
        })

        d3.select("#named-select").on('change', function() {
            console.log(this.value);
            value = this.value

            var currentCompany = datapoints.filter(function(d) {
                if (value == '.circle') {
                    return datapoints
                } else {
                    return d.Group === value.slice(1)
                }
            })
            var companyName = currentCompany.map(function(d) {
                return d.Company;
            })
            companyName = d3.set(companyName).values();

            var numberCompany = companyName.length

            companyScale.domain(companyName).range([0, height]);
            svg.selectAll('.y-axis')

            .call(yAxis)

            svg.selectAll("circle")
                .transition()
                .duration(1200)
                .style('opacity', 0)
                .style('pointer-events', 'none')
                .style('r', 0)

            svg.selectAll(value)
                .transition()
                .duration(1200)
                .attr("cy", function(d) {
                    return companyScale(d.Company)
                })
                .style('pointer-events', 'all')
                .style('opacity', 0.2);
        })


        d3.select("#All")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';

                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length

                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll("circle")
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('pointer-events', 'none')
                    .style('r', 0)

                svg.selectAll(".circle" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')
                        .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll("circle" + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })



        d3.select("#Mortgage")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';

                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length

                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                //console.log(classInsert);
                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('pointer-events', 'none')
                    .style('r', 0)

                svg.selectAll(".Mortgage" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {

                    var value = this.value
                    console.log(value.slice(1));

                    //  switch domain
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Mortgage' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })


        d3.select("#Debt-collection")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length

                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')


                svg.selectAll(".Debt-collection" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var value = this.value
                    console.log(value.slice(1));

                    //  switch domain
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')
                        .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Debt-collection' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })

            })

        d3.select("#Credit-reporting")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')
                svg.selectAll(".Credit-reporting" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    var value = this.value
                    console.log(value.slice(1));

                    //  switch domain
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Credit-reporting' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        d3.select("#Credit-card")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')
                svg.selectAll(".Credit-card" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);


                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Credit-card' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        d3.select("#Bank-account-or-service")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')
                svg.selectAll(".Bank-account-or-service" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Bank-account-or-service' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })


        d3.select("#Consumer-loan")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')
                svg.selectAll(".Consumer-loan" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Consumer-loan' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        // Student Loan
        d3.select("#Student-loan")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')

                svg.selectAll(".Student-loan" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Student-loan' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        // Preapid Card
        d3.select("#Prepaid-card")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')

                svg.selectAll(".Prepaid-card" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Prepaid-card' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        // Money Transfers
        d3.select("#Money-transfers")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')

                svg.selectAll(".Money-transfers" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Money-transfers' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        // Payday Loan
        d3.select("#Payday-loan")
            .on('click', function(d) {
                var selectedEl = document.getElementById('named-select')
                var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
                var classInsert = selectedStr ? selectedStr : '';
                var currentCompany = datapoints.filter(function(d) {
                    if (classInsert == '.circle') {
                        return datapoints
                    } else {
                        return d.Group === classInsert.slice(1)
                    }
                })
                var companyName = currentCompany.map(function(d) {
                    return d.Company;
                })
                companyName = d3.set(companyName).values();

                var numberCompany = companyName.length
                companyScale.domain(companyName).range([0, numberCompany * 70]);
                svg.selectAll('.y-axis')
                    .call(yAxis)

                svg.selectAll('circle')
                    .transition()
                    .duration(1200)
                    .style('opacity', 0)
                    .style('r', 0)
                    .style('pointer-events', 'none')

                svg.selectAll(".Payday-loan" + classInsert)
                    .style('pointer-events', 'all')
                    .transition()
                    .duration(1200)
                    .attr("cy", function(d) {
                        return companyScale(d.Company)
                    })
                    .style('opacity', 0.2);

                d3.select("#named-select").on('change', function() {
                    console.log(this.value);
                    value = this.value
                    var currentCompany = datapoints.filter(function(d) {
                        if (value == '.circle') {
                            return datapoints
                        } else {
                            return d.Group === value.slice(1)
                        }
                    })
                    var companyName = currentCompany.map(function(d) {
                        return d.Company;
                    })
                    companyName = d3.set(companyName).values();

                    var numberCompany = companyName.length

                    companyScale.domain(companyName).range([0, numberCompany * 70]);
                    svg.selectAll('.y-axis')

                    .call(yAxis)

                    svg.selectAll("circle")
                        .transition()
                        .duration(1200)
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style('r', 0)

                    svg.selectAll('.Payday-loan' + value)
                        .transition()
                        .duration(1200)
                        .attr("cy", function(d) {
                            return companyScale(d.Company)
                        })
                        .style('pointer-events', 'all')
                        .style('opacity', 0.2);
                })
            })

        // Other Financial Service
        // d3.select("#Other-financial-service")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Other-financial-service" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Other-financial-service' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })

        // Virtual Currency
        // d3.select("#Virtual-currency")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Virtual-currency" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Virtual-currency' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })

      // Credit-reporting-credit-repair-services-or-other-personal-consumer-reports
      // d3.select("#Credit-reporting-credit-repair-services-or-other-personal-consumer-reports")
      //     .on('click', function(d) {
      //         var selectedEl = document.getElementById('named-select')
      //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
      //         var classInsert = selectedStr ? selectedStr : '';
      //         var currentCompany = datapoints.filter(function(d) {
      //             if (classInsert == '.circle') {
      //                 return datapoints
      //             } else {
      //                 return d.Group === classInsert.slice(1)
      //             }
      //         })
      //         var companyName = currentCompany.map(function(d) {
      //             return d.Company;
      //         })
      //         companyName = d3.set(companyName).values();
      //
      //         var numberCompany = companyName.length
      //         companyScale.domain(companyName).range([0, numberCompany * 70]);
      //         svg.selectAll('.y-axis')
      //             .call(yAxis)
      //
      //         svg.selectAll('circle')
      //             .transition()
      //             .duration(1200)
      //             .style('opacity', 0)
      //             .style('r', 0)
      //             .style('pointer-events', 'none')
      //
      //         svg.selectAll(".Credit-reporting-credit-repair-services-or-other-personal-consumer-reports" + classInsert)
      //             .style('pointer-events', 'all')
      //             .transition()
      //             .duration(1200)
      //             .attr("cy", function(d) {
      //                 return companyScale(d.Company)
      //             })
      //             .style('opacity', 0.2);
      //
      //         d3.select("#named-select").on('change', function() {
      //             console.log(this.value);
      //             value = this.value
      //             var currentCompany = datapoints.filter(function(d) {
      //                 if (value == '.circle') {
      //                     return datapoints
      //                 } else {
      //                     return d.Group === value.slice(1)
      //                 }
      //             })
      //             var companyName = currentCompany.map(function(d) {
      //                 return d.Company;
      //             })
      //             companyName = d3.set(companyName).values();
      //
      //             var numberCompany = companyName.length
      //
      //             companyScale.domain(companyName).range([0, numberCompany * 70]);
      //             svg.selectAll('.y-axis')
      //
      //             .call(yAxis)
      //
      //             svg.selectAll("circle")
      //                 .transition()
      //                 .duration(1200)
      //                 .style('opacity', 0)
      //                 .style('pointer-events', 'none')
      //                 .style('r', 0)
      //
      //             svg.selectAll('.Credit-reporting-credit-repair-services-or-other-personal-consumer-reports' + value)
      //                 .transition()
      //                 .duration(1200)
      //                 .attr("cy", function(d) {
      //                     return companyScale(d.Company)
      //                 })
      //                 .style('pointer-events', 'all')
      //                 .style('opacity', 0.2);
      //         })
      //     })

      // Credit-card-or-prepaid-card
      // d3.select("#Credit-card-or-prepaid-card")
      //     .on('click', function(d) {
      //         var selectedEl = document.getElementById('named-select')
      //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
      //         var classInsert = selectedStr ? selectedStr : '';
      //         var currentCompany = datapoints.filter(function(d) {
      //             if (classInsert == '.circle') {
      //                 return datapoints
      //             } else {
      //                 return d.Group === classInsert.slice(1)
      //             }
      //         })
      //         var companyName = currentCompany.map(function(d) {
      //             return d.Company;
      //         })
      //         companyName = d3.set(companyName).values();
      //
      //         var numberCompany = companyName.length
      //         companyScale.domain(companyName).range([0, numberCompany * 70]);
      //         svg.selectAll('.y-axis')
      //             .call(yAxis)
      //
      //         svg.selectAll('circle')
      //             .transition()
      //             .duration(1200)
      //             .style('opacity', 0)
      //             .style('r', 0)
      //             .style('pointer-events', 'none')
      //
      //         svg.selectAll(".Credit-card-or-prepaid-card" + classInsert)
      //             .style('pointer-events', 'all')
      //             .transition()
      //             .duration(1200)
      //             .attr("cy", function(d) {
      //                 return companyScale(d.Company)
      //             })
      //             .style('opacity', 0.2);
      //
      //         d3.select("#named-select").on('change', function() {
      //             console.log(this.value);
      //             value = this.value
      //             var currentCompany = datapoints.filter(function(d) {
      //                 if (value == '.circle') {
      //                     return datapoints
      //                 } else {
      //                     return d.Group === value.slice(1)
      //                 }
      //             })
      //             var companyName = currentCompany.map(function(d) {
      //                 return d.Company;
      //             })
      //             companyName = d3.set(companyName).values();
      //
      //             var numberCompany = companyName.length
      //
      //             companyScale.domain(companyName).range([0, numberCompany * 70]);
      //             svg.selectAll('.y-axis')
      //
      //             .call(yAxis)
      //
      //             svg.selectAll("circle")
      //                 .transition()
      //                 .duration(1200)
      //                 .style('opacity', 0)
      //                 .style('pointer-events', 'none')
      //                 .style('r', 0)
      //
      //             svg.selectAll('.Credit-card-or-prepaid-card' + value)
      //                 .transition()
      //                 .duration(1200)
      //                 .attr("cy", function(d) {
      //                     return companyScale(d.Company)
      //                 })
      //                 .style('pointer-events', 'all')
      //                 .style('opacity', 0.2);
      //         })
      //     })

        // Checking-or-savings-account
        // d3.select("#Checking-or-savings-account")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Checking-or-savings-account" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Checking-or-savings-account' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })

        // Money-transfer-virtual-currency-or-money-service
        // d3.select("#Money-transfer-virtual-currency-or-money-service")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Money-transfer-virtual-currency-or-money-service" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Money-transfer-virtual-currency-or-money-service' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })

        // Vehicle-loan-or-lease
        // d3.select("#Vehicle-loan-or-lease")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Vehicle-loan-or-lease" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Vehicle-loan-or-lease' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })

        // Payday-loan-title-loan-or-personal-loan
        // d3.select("#Payday-loan-title-loan-or-personal-loan")
        //     .on('click', function(d) {
        //         var selectedEl = document.getElementById('named-select')
        //         var selectedStr = selectedEl.options[selectedEl.selectedIndex].value;
        //         var classInsert = selectedStr ? selectedStr : '';
        //         var currentCompany = datapoints.filter(function(d) {
        //             if (classInsert == '.circle') {
        //                 return datapoints
        //             } else {
        //                 return d.Group === classInsert.slice(1)
        //             }
        //         })
        //         var companyName = currentCompany.map(function(d) {
        //             return d.Company;
        //         })
        //         companyName = d3.set(companyName).values();
        //
        //         var numberCompany = companyName.length
        //         companyScale.domain(companyName).range([0, numberCompany * 70]);
        //         svg.selectAll('.y-axis')
        //             .call(yAxis)
        //
        //         svg.selectAll('circle')
        //             .transition()
        //             .duration(1200)
        //             .style('opacity', 0)
        //             .style('r', 0)
        //             .style('pointer-events', 'none')
        //
        //         svg.selectAll(".Payday-loan-title-loan-or-personal-loan" + classInsert)
        //             .style('pointer-events', 'all')
        //             .transition()
        //             .duration(1200)
        //             .attr("cy", function(d) {
        //                 return companyScale(d.Company)
        //             })
        //             .style('opacity', 0.2);
        //
        //         d3.select("#named-select").on('change', function() {
        //             console.log(this.value);
        //             value = this.value
        //             var currentCompany = datapoints.filter(function(d) {
        //                 if (value == '.circle') {
        //                     return datapoints
        //                 } else {
        //                     return d.Group === value.slice(1)
        //                 }
        //             })
        //             var companyName = currentCompany.map(function(d) {
        //                 return d.Company;
        //             })
        //             companyName = d3.set(companyName).values();
        //
        //             var numberCompany = companyName.length
        //
        //             companyScale.domain(companyName).range([0, numberCompany * 70]);
        //             svg.selectAll('.y-axis')
        //
        //             .call(yAxis)
        //
        //             svg.selectAll("circle")
        //                 .transition()
        //                 .duration(1200)
        //                 .style('opacity', 0)
        //                 .style('pointer-events', 'none')
        //                 .style('r', 0)
        //
        //             svg.selectAll('.Payday-loan-title-loan-or-personal-loan' + value)
        //                 .transition()
        //                 .duration(1200)
        //                 .attr("cy", function(d) {
        //                     return companyScale(d.Company)
        //                 })
        //                 .style('pointer-events', 'all')
        //                 .style('opacity', 0.2);
        //         })
        //     })


    }




})();
