import * as React from "react";
import { Select } from "baseui/select";
import { Card } from "baseui/card";
import { StyledLink } from "baseui/link";

import { years } from "../data";
import { head, isNil, propOr, remove, reduce } from "ramda";
import { useEffect } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { format, parseISO } from "date-fns";

enum Column {
  _id,
  Calendar,
  WeekStarting,
  GreenBin,
  Garbage,
  Recycling,
  YardWaste,
  ChristmasTree
}

enum Status {
  Scheduled = "F",
  NotScheduled = "0"
}

enum CalendarStatus {
  Christmas = "Christmas Tree/Garbage Day",
  Recycling = "Recycling Day",
  Garbage = "Garbage Day"
}

enum CalendarDescription {
  Christmas = "In addition to Garbage and Green Bin waste, Christmas tree collection occurs Today. When placing your tree out for collection, please remove all decorations, tinsel, etc and do not place out in any type of bag",
  Recycling = "Put out Recycling and Green Bin waste! For more information on what can be recycled click here: http://www.toronto.ca/garbage/bluebin.htm",
  Garbage = "Put out Garbage, Yard and Green Bin waste! Any oversized items must be placed within 2 meters of your trash can. Find basic sorting information here: http://app.toronto.ca/wes/winfo/search.do"
}

type Day = {
  week: any;
  isRecycling: boolean;
  isGarbageDay: boolean;
  isChristmasTreeDay: boolean;
};
const processData = ({ data }: any): Day[] => {
  const rows = remove(0, 1, data);

  return reduce(
    (acc: any, row: any) => {
      if (!acc[row[Column.Calendar]]) {
        acc[row[Column.Calendar]] = [];
      }

      acc[row[Column.Calendar]].push({
        week: row[Column.WeekStarting],
        isRecycling: row[Column.Recycling] === Status.Scheduled,
        isGarbageDay:
          row[Column.Garbage] === Status.Scheduled &&
          row[Column.ChristmasTree] === Status.NotScheduled,
        isChristmasTreeDay: row[Column.ChristmasTree] === Status.Scheduled
      });

      return acc;
    },
    {},
    rows
  );
};

const createCalendarData = (data: Day[]) => {
  return data.map((day: Day) => {
    let Subject;
    let StartDate;
    let Description;
    StartDate = format(parseISO(day.week), "MM/dd/yyyy");
    if (day.isChristmasTreeDay) {
      Subject = CalendarStatus.Christmas;
      Description = CalendarDescription.Christmas;
    } else if (day.isRecycling) {
      Subject = CalendarStatus.Recycling;
      Description = CalendarDescription.Recycling;
    } else {
      Subject = CalendarStatus.Garbage;
      Description = CalendarDescription.Garbage;
    }
    return {
      Subject,
      "Start Date": StartDate,
      "All Day Event": true,
      Description
    };
  });
};

export const GarbageCollection = () => {
  const [value, setValue] = React.useState();
  const [calendars, setCalendars] = React.useState([]);
  const [selected, setSelected] = React.useState();

  useEffect(() => {
    if (isNil(value)) return;
    const result = Papa.parse(propOr("", "value", head(value)));
    const processed = processData(result);
    const options = Object.keys(processed).map((key: any) => {
      return {
        label: key,
        id: key,
        value: processed[key]
      };
    });
    setCalendars(options as any);
  }, [value]);

  useEffect(() => {
    if (!selected) return;
    const value = propOr<Day[], string, Day[]>([], "value", head(selected));
    const id = propOr<string, string, string>("", "id", head(selected));
    const calendarData = createCalendarData(value);
    const csv = Papa.unparse(calendarData as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${id}.csv`);
  }, [selected]);

  return (
    <Card overrides={{ Root: { style: { width: "80vw", margin: "0 auto" } } }}>
      <p>
        Visit{" "}
        <StyledLink target="_blank" href="https://www.toronto.ca/services-payments/recycling-organics-garbage/houses/collection-schedule/">
          Toronto's Garbage Portal
        </StyledLink>{" "}
        to figure out what calendar group you are in.
      </p>
      <Select
        options={[{ label: "2020", id: "2020", value: years["2020"] }]}
        value={value}
        placeholder="Select a year"
        onChange={params => {
          setValue(params.value);
        }}
      />
      <Select
        options={calendars}
        onSelectResetsInput={false}
        value={selected}
        placeholder="Select a calendar"
        onChange={params => {
          setSelected(params.value);
        }}
      />
    </Card>
  );
};
